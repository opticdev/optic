pub use super::{diff_interaction, diff_shape};
use crate::commands::{
  CommandContext, RfcCommand, SpecCommand, SpecCommandError, SpecCommandHandler,
};
use crate::events::SpecEvent;
use crate::projections::SpecProjection;
use cqrs_core::Aggregate;

/// Create an interface that allows commands to be applied to a spec as part of a single
/// batch. Will produce events enclosed in `BatchCommitStarted` and `BatchCommitEnded`.
pub fn append_batch(
  spec_projection: SpecProjection,
  commit_message: String,
  batch_command_context: CommandContext,
) -> AppendedBatch {
  AppendedBatch::new(spec_projection, commit_message, batch_command_context)
}

pub struct AppendedBatch {
  batch_id: String,
  command_handler: SpecCommandHandler,
  new_events: Vec<SpecEvent>,
}

impl AppendedBatch {
  pub fn new(
    spec_projection: SpecProjection,
    commit_message: String,
    batch_command_context: CommandContext,
  ) -> Self {
    let batch_id = batch_command_context.client_command_batch_id.clone();
    let mut command_handler = SpecCommandHandler::new(batch_command_context, spec_projection);

    let append_batch = SpecCommand::from(RfcCommand::append_batch_commit(
      batch_id.clone(),
      String::from(commit_message),
    ));
    let mut new_events = Vec::new();

    // Start event
    let start_event = command_handler
      .execute(append_batch)
      .expect("should be able to append new batch commit to spec")
      .remove(0);

    command_handler.apply(start_event.clone());

    new_events.push(start_event);

    Self {
      batch_id,
      command_handler,
      new_events,
    }
  }

  pub fn with_command(&mut self, command: SpecCommand) -> Result<(), SpecCommandError> {
    let command_handler = &mut self.command_handler;
    let new_events = &mut self.new_events;

    let mut events = command_handler.execute(command)?;

    for event in &events {
      self.command_handler.apply(event.clone());
    }

    new_events.append(&mut events);

    Ok(())
  }

  pub fn commit(self) -> Vec<SpecEvent> {
    let mut new_events = self.new_events;
    let end_event = self
      .command_handler
      .execute(SpecCommand::from(RfcCommand::end_batch_commit(
        self.batch_id.clone(),
      )))
      .expect("should be able to append new batch commit to spec")
      .remove(0);

    new_events.push(end_event);

    new_events
  }
}
