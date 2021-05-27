use super::events_from_chunks;

use clap::{App, Arg, ArgGroup, ArgMatches, SubCommand};
use futures::{try_join, SinkExt, Stream, StreamExt, TryStreamExt};
use nanoid::nanoid;
use serde_json;
use std::sync::Arc;
use tokio::io::{stdin, stdout, AsyncWrite};
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;

use optic_engine::streams;
use optic_engine::Aggregate;
use optic_engine::{
  analyze_documented_bodies, analyze_undocumented_bodies, InteractionDiffResult,
  LearnedShapeDiffAffordancesProjection, LearnedUndocumentedBodiesProjection,
};
use optic_engine::{
  HttpInteraction, SpecChunkEvent, SpecEvent, SpecIdGenerator, SpecProjection, TaggedInput,
};

pub const SUBCOMMAND_NAME: &'static str = "learn";

pub fn create_subcommand<'a, 'b>() -> App<'a, 'b> {
  SubCommand::with_name(SUBCOMMAND_NAME)
    .about("Learns about possible changes to the spec based on interactions or diffs")
    .arg(
      Arg::with_name("undocumented-bodies")
        .long("undocumented-bodies")
        .takes_value(false)
        .help("Learn shapes of undocumented bodies from interactions piped to stdin"),
    )
    .arg(
      Arg::with_name("shape-diffs-affordances")
        .long("shape-diffs-affordances")
        .takes_value(false)
        .requires("tagged-diff-results")
        .help("Learn affordances for diff trails from interactions piped to stdin"),
    )
    .arg(
      Arg::with_name("tagged-diff-results")
        .long("tagged-diff-results")
        .takes_value(true)
        .help("Path to file containing diff results for which to learn affordances"),
    )
    .group(
      ArgGroup::with_name("subject")
        .args(&["undocumented-bodies", "shape-diffs-affordances"])
        .multiple(false)
        .required(true),
    )
}

pub async fn main<'a>(
  command_matches: &'a ArgMatches<'a>,
  spec_chunks: Vec<SpecChunkEvent>,
  input_queue_size: usize,
) {
  let spec_events = events_from_chunks(spec_chunks).await;

  if command_matches.is_present("undocumented-bodies") {
    let stdin = stdin();
    let interaction_lines = streams::http_interaction::json_lines(stdin);
    let sink = stdout();

    learn_undocumented_bodies(spec_events, input_queue_size, interaction_lines, sink).await;
  } else if command_matches.is_present("shape-diffs-affordances") {
    let diffs_path = command_matches
      .value_of("tagged-diff-results")
      .expect("tagged-diff-results is required for shape-diffs learning subject");

    let stdin = stdin();
    let interaction_lines = streams::http_interaction::json_lines(stdin);
    let diffs = streams::diff::tagged_from_json_line_file(diffs_path)
      .await
      .expect("could not read diffs")
      .into_iter()
      .map(TaggedInput::into_input);

    let sink = stdout();

    learn_shape_diff_affordances(
      spec_events,
      diffs,
      input_queue_size,
      interaction_lines,
      sink,
    )
    .await;
  } else {
    unreachable!("subject is required");
  }
}

async fn learn_undocumented_bodies<S: 'static + AsyncWrite + Unpin + Send>(
  spec_events: Vec<SpecEvent>,
  input_queue_size: usize,
  interaction_lines: impl Stream<Item = Result<String, std::io::Error>>,
  sink: S,
) {
  let spec_projection = Arc::new(SpecProjection::from(spec_events));

  let (analysis_sender, analysis_receiver) = mpsc::channel(32);

  let analyzing_bodies = async move {
    let analyze_results = interaction_lines
      .map(Ok)
      .try_for_each_concurrent(input_queue_size, |interaction_json_result| {
        let projection = spec_projection.clone();
        let analysis_sender = analysis_sender.clone();

        let analyze_task = tokio::spawn(async move {
          let analyze_comp = tokio::task::spawn_blocking(move || {
            let interaction_json =
              interaction_json_result.expect("can rad interaction json line form stdin");

            let interaction: HttpInteraction =
              serde_json::from_str(&interaction_json).expect("could not parse interaction json");

            analyze_undocumented_bodies(&projection, interaction)
          });

          match analyze_comp.await {
            Ok(results) => {
              for result in results {
                analysis_sender
                  .send(result)
                  .await
                  .expect("could not send analysis result to aggregation channel")
              }
            }
            Err(err) => {
              // ignore a single interaction not being able to deserialize
              eprintln!("interaction ignored: {}", err);
            }
          }
        });

        analyze_task
      })
      .await;

    analyze_results
  };

  let aggregating_results = tokio::spawn(async move {
    let mut analysiss = ReceiverStream::new(analysis_receiver);
    let mut id_generator = IdGenerator::default();

    let mut learned_undocumented_bodies = LearnedUndocumentedBodiesProjection::default();

    while let Some(analysis) = analysiss.next().await {
      learned_undocumented_bodies.apply(analysis);
    }

    let endpoint_bodies = learned_undocumented_bodies
      .into_endpoint_bodies(&mut id_generator)
      .collect::<Vec<_>>();

    streams::write_to_json_lines(sink, endpoint_bodies.iter())
      .await
      .expect("could not write endpoint bodies to stdout");
  });

  try_join!(analyzing_bodies, aggregating_results).expect("essential worker task panicked");
}

async fn learn_shape_diff_affordances<S: 'static + AsyncWrite + Unpin + Send>(
  spec_events: Vec<SpecEvent>,
  diffs: impl Iterator<Item = InteractionDiffResult>,
  input_queue_size: usize,
  interaction_lines: impl Stream<Item = Result<String, std::io::Error>>,
  sink: S,
) {
  let spec_projection = Arc::new(SpecProjection::from(spec_events));
  let mut learned_shape_diff_affordances: LearnedShapeDiffAffordancesProjection = diffs.collect();

  let (analysis_sender, analysis_receiver) = mpsc::channel(32);

  let analyzing_bodies = {
    let spec_projection = spec_projection.clone();

    async move {
      let analyze_results = interaction_lines
        .map(Ok)
        .try_for_each_concurrent(input_queue_size, |interaction_json_result| {
          let analysis_sender = analysis_sender.clone();
          let spec_projection = spec_projection.clone();

          let analyze_task = tokio::spawn(async move {
            let analyze_comp = tokio::task::spawn_blocking(move || {
              let interaction_json =
                interaction_json_result.expect("can read interaction json line form stdin");

              let TaggedInput(interaction, interaction_tags): TaggedInput<HttpInteraction> =
                serde_json::from_str(&interaction_json).expect("could not parse interaction json");

              (
                analyze_documented_bodies(&spec_projection, interaction),
                interaction_tags,
              )
            });

            match analyze_comp.await {
              Ok((results, interaction_tags)) => {
                for result in results {
                  let tagged = TaggedInput(result, interaction_tags.clone());
                  analysis_sender
                    .send(tagged)
                    .await
                    .expect("could not send analysis result to aggregation channel")
                }
              }
              Err(err) => {
                // ignore a single interaction not being able to deserialize
                eprintln!("interaction ignored: {}", err);
              }
            }
          });

          analyze_task
        })
        .await;

      analyze_results
    }
  };

  let aggregating_results = {
    let mut analysiss = ReceiverStream::new(analysis_receiver);

    tokio::spawn(async move {
      while let Some(tagged_analysis) = analysiss.next().await {
        learned_shape_diff_affordances.apply(tagged_analysis);
      }

      let mut json_lines_sink = streams::shape_diff_affordances::into_json_lines(sink);

      for (fingerprint, affordances) in learned_shape_diff_affordances {
        if let Err(err) = json_lines_sink.send((affordances, fingerprint)).await {
          panic!("Could not write result to stdout: {}", err);
        }
      }
    })
  };

  try_join!(analyzing_bodies, aggregating_results).expect("essential worker task panicked");
}

#[derive(Debug, Default)]
struct IdGenerator;

impl SpecIdGenerator for IdGenerator {
  fn generate_id(&mut self, prefix: &str) -> String {
    // NanoID @ 10 chars:
    // - URL-safe,
    // - 17 years for a 1% chance of at least one global collision assuming
    //   writing 1000 ids per hour (https://zelark.github.io/nano-id-cc/)
    format!("{}{}", prefix, nanoid!(10))
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use path_absolutize::*;
  use serde_json::json;
  use std::path::Path;
  use tokio::fs;

  #[tokio::main]
  #[test]
  async fn can_learn_endpoint_bodies_from_interactions() {
    let spec_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded":{"pathId":"path_id_1","parentPathId":"root","name":"todos"}}
    ]))
    .expect("initial spec events should be valid events");

    // TODO: feed actual interactions and assert the output
    let interaction_lines = streams::http_interaction::json_lines(tokio::io::empty());
    let sink = tokio::io::sink();

    learn_undocumented_bodies(spec_events, 1, interaction_lines, sink).await;
  }

  #[tokio::main]
  #[test]
  async fn can_learn_shape_diffs_affordances_from_interactions() {
    let spec_events_path = Path::new("../tests/fixtures/ergast-example-spec.json")
      .absolutize()
      .unwrap()
      .to_path_buf();
    let diffs_path = Path::new("../tests/fixtures/ergast-captures/diff-results.jsonl")
      .absolutize()
      .unwrap()
      .to_path_buf();
    let interactions_path =
      Path::new("../tests/fixtures/ergast-captures/ergast-simulated-traffic.jsonl")
        .absolutize()
        .unwrap()
        .to_path_buf();

    let spec_events = streams::spec_events::from_file(spec_events_path)
      .await
      .expect("should be able to read test spec fixture");

    let diffs = streams::diff::tagged_from_json_line_file(diffs_path)
      .await
      .expect("should be able to read test diffs fixture")
      .into_iter()
      .map(TaggedInput::into_input);

    let interaction_lines =
      streams::http_interaction::json_lines(fs::File::open(interactions_path).await.unwrap());

    learn_shape_diff_affordances(spec_events, diffs, 1, interaction_lines, tokio::io::sink()).await;
  }
}
