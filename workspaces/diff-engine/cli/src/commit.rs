use super::events_from_chunks;
use chrono::Utc;
use clap::{App, Arg, ArgMatches, SubCommand};
use futures::StreamExt;
use optic_diff_engine::streams;
use optic_diff_engine::Aggregate;
use optic_diff_engine::CommandContext;
use optic_diff_engine::{RfcCommand, SpecCommand, SpecCommandHandler};
use optic_diff_engine::{SpecChunkEvent, SpecEvent};
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
  let mut spec_command_handler = SpecCommandHandler::from(spec_events.clone());

  let stdin = stdin(); // TODO: deal with std in never having been attached

  let input_commands = streams::spec_events::from_json_lines(stdin);

  let batch_id = Uuid::new_v4().to_hyphenated().to_string();
  let batch_command_context = CommandContext::new(
    batch_id.clone(),
    String::from(client_id),
    String::from(client_session_id),
    Utc::now(),
  );
  spec_command_handler.with_command_context(batch_command_context);

  let append_batch = SpecCommand::from(RfcCommand::append_batch_commit(
    batch_id.clone(),
    String::from(commit_message),
  ));

  // Start event
  let start_event = spec_command_handler
    .execute(append_batch)
    .expect("should be able to append new batch commit to spec")
    .remove(0);

  spec_command_handler.apply(start_event.clone());

  // input events
  let mut input_events: Vec<SpecEvent> = input_commands
    .map(|command_json_result| -> Vec<SpecEvent> {
      // TODO: provide more useful error messages, like forwarding command validation errors
      let command_json = command_json_result.expect("can read input commands as jsonl from stdin");
      let command: SpecCommand =
        serde_json::from_str(&command_json).expect("could not parse command");
      let events = spec_command_handler
        .execute(command)
        .expect("could not execute command");

      for event in &events {
        spec_command_handler.apply(event.clone());
      }

      events
    })
    .collect::<Vec<_>>()
    .await
    .into_iter()
    .flatten()
    .collect();

  // end events
  let end_event = spec_command_handler
    .execute(SpecCommand::from(RfcCommand::end_batch_commit(
      batch_id.clone(),
    )))
    .expect("should be able to append new batch commit to spec")
    .remove(0);
  spec_command_handler.apply(end_event.clone());

  let mut new_events = Vec::with_capacity(input_events.len() + 2);
  new_events.push(start_event);
  new_events.append(&mut input_events);
  new_events.push(end_event);

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
