use clap::{crate_version, App, Arg, ArgGroup, SubCommand};
use futures::try_join;
use futures::SinkExt;
use futures::{StreamExt, TryStreamExt};
use num_cpus;
use optic_engine::diff_interaction;
use optic_engine::errors;
use optic_engine::streams;
use optic_engine::HttpInteraction;
use optic_engine::InteractionDiffResult;
use optic_engine::SpecProjection;
use optic_engine::{SpecChunkEvent, SpecEvent};
use std::cmp;
use std::process;
use std::sync::Arc;
use tokio::io::{stdin, stdout};
use tokio::sync::mpsc;

mod commit;
mod learn;

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
    .subcommand(commit::create_subcommand())
    .subcommand(learn::create_subcommand())
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

  let input_queue_size = cmp::min(
    num_cpus::get(),
    core_threads_count.unwrap_or(num_cpus::get() as u16) as usize,
  ) * 4;

  runtime.block_on(async {
    let spec_chunks = match spec_path_type {
      SpecPathType::FILE => streams::spec_chunks::from_root_api_file(&spec_path)
        .await
        .map_err(|err| match err {
          errors::SpecChunkLoaderError::Io(err) => {
            eprintln!("Could not read specification file: {}", err);
            process::exit(1);
          }
          errors::SpecChunkLoaderError::Json(err) => {
            eprintln!("Specification JSON file could not be parsed: {}", err);
            process::exit(1);
          }
          _ => unreachable!("Specification file not currently serialized as any other but JSON"),
        })
        .unwrap(),

      SpecPathType::DIR => streams::spec_chunks::from_api_dir(&spec_path)
        .await
        .expect("should be able to find spec event chunks in a folder"),
    };

    match matches.subcommand() {
      ("assemble", Some(_)) => {
        // eprintln!("assembling spec folder into spec");
        assemble(spec_chunks).await;
      }
      (commit::SUBCOMMAND_NAME, Some(subcommand_matches)) => {
        commit::main(subcommand_matches, spec_chunks, spec_path).await
      }
      (learn::SUBCOMMAND_NAME, Some(subcommand_matches)) => {
        learn::main(subcommand_matches, spec_chunks, input_queue_size).await
      }
      _ => {
        eprintln!("diffing interations against a spec");
        eprintln!("using input queue size {}", input_queue_size);

        diff(events_from_chunks(spec_chunks).await, input_queue_size).await;
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

async fn assemble(spec_chunks: Vec<SpecChunkEvent>) {
  let spec_events = events_from_chunks(spec_chunks).await;

  let stdout = stdout();

  streams::spec_events::write_to_json_array(stdout, &spec_events)
    .await
    .unwrap_or_else(|err| panic!("could not write new events to stdout: {}", err));
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

async fn events_from_chunks(chunks: Vec<SpecChunkEvent>) -> Vec<SpecEvent> {
  streams::spec_events::from_spec_chunks(chunks)
    .await
    .unwrap() // TODO: report on these errors in a more user-friendly way (like for single spec files)
}

#[cfg(test)]
mod test {
  #[test]
  pub fn do_a_diff() {
    assert_eq!(true, true, "wouldn't you know");
  }
}
