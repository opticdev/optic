use super::events_from_chunks;

use clap::{App, Arg, ArgGroup, ArgMatches, SubCommand};
use futures::{try_join, StreamExt, TryStreamExt};
use serde::Serialize;
use serde_json;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::io::{stdin, stdout};
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use uuid::Uuid;

use optic_diff_engine::streams;
use optic_diff_engine::{analyze_undocumented_bodies, SpecCommand};
use optic_diff_engine::{
  BodyAnalysisLocation, HttpInteraction, SpecChunkEvent, SpecEvent, SpecProjection,
  TrailObservationsResult,
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
    let stdout = stdout();

    let mut analysiss = ReceiverStream::new(analysis_receiver);

    let mut observations_by_body_location = HashMap::new();
    while let Some(analysis) = analysiss.next().await {
      let existing_observations = observations_by_body_location
        .entry(analysis.body_location)
        .or_insert_with(|| TrailObservationsResult::default());

      existing_observations.union(analysis.trail_observations);
    }

    let mut endpoint_bodies_by_endpoint = HashMap::new();
    for (body_location, observations) in observations_by_body_location {
      let (root_shape_id, commands) = observations.into_commands(&mut generate_id);
      let (content_type, status_code, path_id, method) = match &body_location {
        BodyAnalysisLocation::Request {
          content_type,
          path_id,
          method,
        } => (content_type.clone(), None, path_id.clone(), method.clone()),
        BodyAnalysisLocation::Response {
          content_type,
          status_code,
          path_id,
          method,
        } => (
          content_type.clone(),
          Some(*status_code),
          path_id.clone(),
          method.clone(),
        ),
      };

      if let Some(root_shape_id) = root_shape_id {
        let endpoint_body = EndpointBody {
          content_type,
          status_code,
          commands: commands.collect(),
          root_shape_id,
        };

        let endpoint_bodies = endpoint_bodies_by_endpoint
          .entry((path_id, method))
          .or_insert_with_key(|(path_id, method)| {
            EndpointBodies::new(path_id.clone(), method.clone())
          });

        endpoint_bodies.push_body(endpoint_body);
      }
    }

    streams::write_to_json_lines(stdout, endpoint_bodies_by_endpoint.values())
      .await
      .expect("could not write endpoint bodies to stdout");
  });

  try_join!(analyzing_bodies, aggregating_results).expect("essential worker task panicked");
}

fn generate_id() -> String {
  uuid::Uuid::new_v4().to_hyphenated().to_string()
}

#[derive(Default, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct EndpointBodies {
  path_id: String,
  method: String,
  requests: Vec<EndpointBody>,
  response: Vec<EndpointBody>,
}

impl EndpointBodies {
  pub fn new(path_id: String, method: String) -> Self {
    Self {
      path_id,
      method,
      requests: vec![],
      response: vec![],
    }
  }

  pub fn push_body(&mut self, body: EndpointBody) {
    // TODO: get rid of this ducktyping and introduce EndpointRequestBody and EndpointResponseBody
    let collection = match body.status_code {
      Some(_) => &mut self.response,
      None => &mut self.requests,
    };

    collection.push(body);
  }
}

#[derive(Default, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct EndpointBody {
  content_type: String,
  status_code: Option<u16>,
  commands: Vec<SpecCommand>,
  root_shape_id: String,
}
