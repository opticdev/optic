use clap::{crate_version, App, Arg, ArgGroup, SubCommand};
use futures::try_join;
use futures::SinkExt;
use futures::{StreamExt, TryStreamExt};
use num_cpus;
use optic_diff_engine::diff_interaction;
use optic_diff_engine::errors;
use optic_diff_engine::streams;
use optic_diff_engine::Aggregate;
use optic_diff_engine::HttpInteraction;
use optic_diff_engine::InteractionDiffResult;
use optic_diff_engine::SpecProjection;
use optic_diff_engine::{RfcCommand, SpecCommand};
use optic_diff_engine::{RfcEvent, SpecChunkEvent, SpecEvent};
use std::cmp;
use std::path::Path;
use std::process;
use std::sync::Arc;
use tokio::io::{stdin, stdout, AsyncWriteExt};
use tokio::sync::mpsc;

fn main() {
  let cli = App::new("Optic Engine CLI")
    .version(crate_version!())
    .author("Optic Labs Corporation")
    .about("A command-line interface into the core Optic domain logic")
    .arg(
      Arg::with_name("specification")
        .required(true)
        .value_name("SPEC_PATH")
        .help("The path to the specification that describes the API spec")
        .takes_value(true),
    )
    .arg(
      Arg::with_name("use-spec-file")
        .short("f")
        .takes_value(false)
        .help("SPEC_PATH is expected to be a single file (default)"),
    )
    .arg(
      Arg::with_name("use-spec-dir")
        .short("d")
        .takes_value(false)
        .help("SPEC_PATH is expected to be a directory"),
    )
    .group(
      ArgGroup::with_name("spec-type")
        .args(&["use-spec-file", "use-spec-dir"])
        .multiple(false)
        .required(false),
    )
    .arg(
      Arg::with_name("core-threads")
        .long("core-threads")
        .takes_value(true)
        .required(false)
        .hidden(true)
        .help(
          "Sets the amount of threads used. Defaults to amount of cores available to the system.",
        ),
    )
    .subcommand(
      SubCommand::with_name("assemble")
        .about("Assembles a directory of API spec files into a single events stream"),
    )
    .subcommand(
      SubCommand::with_name("commit")
        .about("Commits results of commands received over stdin as a new batch commit")
        .arg(
          Arg::with_name("commit-message")
            .short("m")
            .required(true)
            .value_name("COMMIT_MESSAGE")
            .takes_value(true)
            .help("The commit message describing the commands as a whole"),
        ),
    )
    .subcommand(
      SubCommand::with_name("diff")
        .about("Detects differences between API spec and captured interactions (default)"),
    );

  let matches = cli.get_matches();

  let spec_path = matches
    .value_of("specification")
    .expect("SPEC_PATH should be required");
  let spec_path_type = match matches.subcommand_name() {
    Some("assemble") | Some("commit") => SpecPathType::DIR,
    _ => {
      if matches.is_present("use-spec-dir") {
        SpecPathType::DIR
      } else {
        SpecPathType::FILE
      }
    }
  };

  let core_threads_count: Option<u16> = match clap::value_t!(matches.value_of("core-threads"), u16)
  {
    Ok(count) => Some(count),
    Err(e) => match e.kind {
      clap::ErrorKind::ArgumentNotFound => None,
      _ => {
        e.exit();
      }
    },
  };

  let mut runtime_builder = tokio::runtime::Builder::new_multi_thread();
  runtime_builder.enable_all();
  if let Some(core_threads) = core_threads_count {
    runtime_builder.worker_threads(core_threads as usize);
  }

  let runtime = runtime_builder.build().unwrap();

  runtime.block_on(async {
    let spec_events = match spec_path_type {
      SpecPathType::FILE => streams::spec_events::from_file(&spec_path)
        .await
        .map_err(|err| match err {
          errors::EventLoadingError::Io(err) => {
            eprintln!("Could not read specification file: {}", err);
            process::exit(1);
          }
          errors::EventLoadingError::Json(err) => {
            eprintln!("Specification JSON file could not be parsed: {}", err);
            process::exit(1);
          }
          _ => unreachable!("Specification file not currently serialized as any other but JSON"),
        })
        .unwrap(),
      SpecPathType::DIR => {
        let spec_chunk_events = streams::spec_chunks::from_api_dir(&spec_path)
          .await
          .expect("should be able to find spec event chunks in a folder");

        streams::spec_events::from_spec_chunks(spec_chunk_events)
          .await
          .unwrap() // TODO: report on these errors in a more user-friendly way (like for single spec files)
      }
    };

    match matches.subcommand() {
      ("assemble", Some(_)) => {
        // eprintln!("assembling spec folder into spec");
        assemble(&spec_events).await;
      }
      ("commit", Some(subcommand_matches)) => {
        let commit_message = subcommand_matches
          .value_of("commit-message")
          .expect("commit-message is required");
        commit(spec_events, &spec_path, commit_message).await;
      }
      _ => {
        eprintln!("diffing interations against a spec");
        let diff_queue_size = cmp::min(
          num_cpus::get(),
          core_threads_count.unwrap_or(num_cpus::get() as u16) as usize,
        ) * 4;
        eprintln!("using diff size {}", diff_queue_size);

        diff(spec_events, diff_queue_size).await;
      }
    };
  });
}

async fn diff(events: Vec<SpecEvent>, diff_queue_size: usize) {
  let spec_projection = Arc::new(SpecProjection::from(events));

  let stdin = stdin(); // TODO: deal with std in never having been attached

  let interaction_lines = streams::http_interaction::json_lines(stdin);

  let (results_sender, mut results_receiver) = mpsc::channel(32); // buffer 32 results

  let results_manager = tokio::spawn(async move {
    let stdout = stdout();
    let mut results_sink = streams::diff::into_json_lines(stdout);

    while let Some(result) = results_receiver.recv().await {
      if let Err(_) = results_sink.send(result).await {
        panic!("could not write diff result to stdout"); // TODO: Find way to actually write error info
      }
    }
  });

  tokio::pin!(results_manager);

  dbg!("waiting for next interaction");

  let diffing_interactions = async move {
    let diff_results = interaction_lines
      .map(Ok)
      .try_for_each_concurrent(diff_queue_size, |interaction_json_result| {
        let projection = spec_projection.clone();
        let results_sender = results_sender.clone();

        let diff_task = tokio::spawn(async move {
          let diff_comp = tokio::task::spawn_blocking::<
            _,
            Option<(Vec<InteractionDiffResult>, Tags)>,
          >(move || {
            let interaction_json =
              interaction_json_result.expect("can read interaction json line from stdin");
            let TaggedInput(interaction, tags): TaggedInput<HttpInteraction> =
              match serde_json::from_str(&interaction_json) {
                Ok(tagged_interaction) => tagged_interaction,
                Err(parse_error) => {
                  eprintln!("could not parse interaction json: {}", parse_error);
                  return None;
                }
              };

            Some((diff_interaction(&projection, interaction), tags))
          });
          //dbg!("waiting for results");
          let results = diff_comp
            .await
            .expect("diffing of interaction should be successful");
          //dbg!("got results");

          if let Some((results, tags)) = results {
            for result in results {
              //dbg!(&result);
              if let Err(_) = results_sender
                .send(ResultContainer::from((result, &tags)))
                .await
              {
                panic!("could not write diff result to results channel");
                // TODO: Find way to actually write error info
              }
            }
          }
        });

        diff_task
      })
      .await;

    dbg!("interactions stream closed");

    drop(results_sender);
    diff_results
  };

  try_join!(diffing_interactions, results_manager).expect("essential worker task panicked");
}

async fn assemble(spec_events: &Vec<SpecEvent>) {
  let stdout = stdout();

  let mut results_sink = streams::spec_events::into_json_array_items(stdout);
  results_sink
    .get_mut()
    .write_u8(b'[')
    .await
    .expect("could not write array start to stdout");

  for spec_event in spec_events {
    if let Err(_) = results_sink.send(spec_event).await {
      panic!("could not stream event result to stdout"); // TODO: Find way to actually write error info
    }
  }
  results_sink
    .get_mut()
    .write_u8(b']')
    .await
    .expect("could not write array start to stdout");

  results_sink
    .get_mut()
    .flush()
    .await
    .expect("could not flush stdout")
}

async fn commit(
  spec_events: Vec<SpecEvent>,
  spec_dir_path: impl AsRef<Path>,
  commit_message: &str,
) {
  let mut spec_projection = SpecProjection::from(spec_events);

  let stdin = stdin(); // TODO: deal with std in never having been attached

  let input_commands = streams::spec_events::from_json_lines(stdin);

  let append_batch = SpecCommand::from(RfcCommand::append_batch_commit(String::from(
    commit_message,
  )));

  // Start event
  let start_event = spec_projection
    .execute(append_batch)
    .expect("should be able to append new batch commit to spec")
    .remove(0);
  let batch_id = match &start_event {
    SpecEvent::RfcEvent(RfcEvent::BatchCommitStarted(event)) => Some(event.batch_id.clone()),
    _ => None,
  }
  .expect("BatchCommitStarted with batch id to have been created");

  spec_projection.apply(start_event.clone());

  // input events
  let mut input_events: Vec<SpecEvent> = input_commands
    .map(|command_json_result| -> Vec<SpecEvent> {
      // TODO: provide more useful error messages, like forwarding command validation errors
      let command_json = command_json_result.expect("can read input commands as jsonl from stdin");
      let command: SpecCommand =
        serde_json::from_str(&command_json).expect("could not parse command");
      let events = spec_projection
        .execute(command)
        .expect("could not execute command");

      for event in &events {
        spec_projection.apply(event.clone());
      }

      events
    })
    .collect::<Vec<_>>()
    .await
    .into_iter()
    .flatten()
    .collect();

  // end events
  let end_event = spec_projection
    .execute(SpecCommand::from(RfcCommand::end_batch_commit(
      batch_id.clone(),
    )))
    .expect("should be able to append new batch commit to spec")
    .remove(0);
  spec_projection.apply(end_event.clone());

  let mut new_events = Vec::with_capacity(input_events.len() + 2);
  new_events.push(start_event);
  new_events.append(&mut input_events);
  new_events.push(end_event);

  let spec_chunk_event = SpecChunkEvent::batch_from_events(batch_id, new_events)
    .expect("valid batch chunk should have been created");

  streams::spec_chunks::to_api_dir(std::iter::once(&spec_chunk_event), spec_dir_path)
    .await
    .unwrap_or_else(|err| {
      panic!("could not write new spec batch chunk to api dir: {:?}", err);
    });

  assemble(spec_chunk_event.events()).await
}

enum SpecPathType {
  FILE,
  DIR,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct TaggedInput<T>(T, Tags);
#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct ResultContainer<T>(T, Tags, String);
type Tags = Vec<String>;

impl From<(InteractionDiffResult, &Tags)> for ResultContainer<InteractionDiffResult> {
  fn from((result, tags): (InteractionDiffResult, &Tags)) -> Self {
    let fingerprint = result.fingerprint();
    Self(result, tags.clone(), fingerprint)
  }
}

#[cfg(test)]
mod test {
  #[test]
  pub fn do_a_diff() {
    assert_eq!(true, true, "wouldn't you know");
  }
}
