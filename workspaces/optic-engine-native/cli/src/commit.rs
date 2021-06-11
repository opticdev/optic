use super::events_from_chunks;
use chrono::Utc;
use clap::{App, Arg, ArgMatches, SubCommand};
use futures::StreamExt;
use optic_engine::append_batch_to_spec;
use optic_engine::streams;
use optic_engine::CommandContext;
use optic_engine::{SpecChunkEvent, SpecEvent};
use optic_engine::{SpecCommand, SpecProjection};
use std::path::Path;
use std::process;
use tokio::io::{stdin, stdout};
use uuid::Uuid;

pub const SUBCOMMAND_NAME: &'static str = "commit";

pub fn create_subcommand<'a, 'b>() -> App<'a, 'b> {
  SubCommand::with_name(SUBCOMMAND_NAME)
    .about("Commits results of commands received over stdin as a new batch commit")
    .arg(
      Arg::with_name("commit-message")
        .short("m")
        .required(true)
        .value_name("COMMIT_MESSAGE")
        .takes_value(true)
        .help("The commit message describing the commands as a whole"),
    )
    .arg(
      Arg::with_name("append-to-root")
        .long("append-to-root")
        .required(false)
        .takes_value(false)
        .help("Append new batch commit to the root spec file, instead of a new spec change file"),
    )
    .arg(
      Arg::with_name("client-session-id")
        .long("client-session-id")
        .required(false)
        .value_name("CLIENT_SESSION_ID")
        .takes_value(true)
        .default_value("unknown-session")
        .help("The session id of the client requesting the commands to be committed"),
    )
    .arg(
      Arg::with_name("client-id")
        .long("client-id")
        .required(false)
        .value_name("CLIENT_ID")
        .takes_value(true)
        .default_value("anonymous")
        .help("Unique id of the client the commands to be committed"),
    )
}

pub async fn main<'a>(
  command_matches: &'a ArgMatches<'a>,
  spec_chunks: Vec<SpecChunkEvent>,
  spec_path: impl AsRef<Path>,
) {
  let commit_message = command_matches
    .value_of("commit-message")
    .expect("commit-message is required");

  let append_to_root = command_matches.is_present("append-to-root");

  if append_to_root
    && !spec_chunks
      .iter()
      .all(|chunk| matches!(chunk, SpecChunkEvent::Root(_)))
  {
    eprintln!("Commits cannot be appended to the root when non-root chunks exist");
    process::exit(1);
  }

  let client_session_id = command_matches
    .value_of("client-session-id")
    .expect("client-session-id is required");

  let client_id = command_matches
    .value_of("client-id")
    .expect("client-id is required");

  commit(
    events_from_chunks(spec_chunks).await,
    &spec_path,
    commit_message,
    append_to_root,
    client_id,
    client_session_id,
  )
  .await;
}

async fn commit(
  spec_events: Vec<SpecEvent>,
  spec_dir_path: impl AsRef<Path>,
  commit_message: &str,
  append_to_root: bool,
  client_id: &str,
  client_session_id: &str,
) {
  let stdin = stdin(); // TODO: deal with std in never having been attached
  let mut input_commands = streams::spec_events::from_json_lines(stdin);

  let batch_id = Uuid::new_v4().to_hyphenated().to_string();
  let batch_command_context = CommandContext::new(
    batch_id.clone(),
    String::from(client_id),
    String::from(client_session_id),
    Utc::now(),
  );

  let mut batch = append_batch_to_spec(
    SpecProjection::from(spec_events.clone()),
    String::from(commit_message),
    batch_command_context,
  );

  // input events
  while let Some(command_json_result) = input_commands.next().await {
    let command_json = command_json_result.expect("can read input commands as jsonl from stdin");
    let command: SpecCommand =
      serde_json::from_str(&command_json).expect("could not parse command");

    batch
      .with_command(command)
      .expect("command could not be applied");
  }

  let mut new_events = batch.commit();

  let spec_chunk_event = if append_to_root {
    let mut all_events = spec_events;
    all_events.append(&mut new_events);
    SpecChunkEvent::root_from_events(all_events)
  } else {
    SpecChunkEvent::batch_from_events(batch_id, new_events)
      .expect("valid batch chunk should have been created")
  };

  streams::spec_chunks::to_api_dir(std::iter::once(&spec_chunk_event), spec_dir_path)
    .await
    .unwrap_or_else(|err| {
      panic!("could not write new spec batch chunk to api dir: {:?}", err);
    });

  streams::spec_events::write_to_json_array(stdout(), spec_chunk_event.events())
    .await
    .unwrap_or_else(|err| panic!("could not write new events to stdout: {}", err))
}
