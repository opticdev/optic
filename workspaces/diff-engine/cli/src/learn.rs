use super::events_from_chunks;

use clap::{App, Arg, ArgGroup, ArgMatches, SubCommand};
use futures::{try_join, StreamExt, TryStreamExt};
use serde_json;
use std::sync::Arc;
use tokio::io::{stdin, stdout};
use tokio::sync::mpsc;

use optic_diff_engine::analyze_undocumented_bodies;
use optic_diff_engine::streams;
use optic_diff_engine::{
  BodyAnalysisResult, HttpInteraction, SpecChunkEvent, SpecEvent, SpecProjection,
};

pub const SUBCOMMAND_NAME: &'static str = "learn";

pub fn create_subcommand<'a, 'b>() -> App<'a, 'b> {
  SubCommand::with_name(SUBCOMMAND_NAME)
    .about("Learns about possible changes to the spec based on interactions or diffs")
    .arg(
      Arg::with_name("undocumented-bodies")
        .takes_value(false)
        .help("Learn shapes of undocumented bodies from interactions piped to stdin"),
    )
    .arg(
      Arg::with_name("shape-diffs")
        .long("shape-diffs")
        .takes_value(false)
        .help("Learn updated shapes from shape diffs piped to stdin"),
    )
    .group(
      ArgGroup::with_name("subject")
        .args(&["undocumented-bodies", "shape-diffs"])
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
    learn_undocumented_bodies(spec_events, input_queue_size).await;
  } else if command_matches.is_present("shape-diffs") {
    todo!("shape diffs learning is yet to be implemented");
  } else {
    unreachable!("subject is required");
  }
}

async fn learn_undocumented_bodies(spec_events: Vec<SpecEvent>, input_queue_size: usize) {
  let spec_projection = Arc::new(SpecProjection::from(spec_events));

  let stdin = stdin();
  let interaction_lines = streams::http_interaction::json_lines(stdin);

  let analyzing_bodies = async move {
    let analyze_results = interaction_lines
      .map(Ok)
      .try_for_each_concurrent(input_queue_size, |interaction_json_result| {
        let projection = spec_projection.clone();
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
              dbg!(results.collect::<Vec<_>>());
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

  try_join!(analyzing_bodies).expect("essential worker task panicked");
}
