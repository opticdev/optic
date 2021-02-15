pub use serde::Deserialize;

pub mod endpoint;
pub mod rfc;
pub mod shape;

pub use endpoint::EndpointCommand;
pub use rfc::RfcCommand;
pub use shape::ShapeCommand;

#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum SpecCommand {
  EndpointCommand(EndpointCommand),
  RfcCommand(RfcCommand),
  ShapeCommand(ShapeCommand),
}

// Errors
// ------

#[derive(Debug)]
pub enum SpecCommandError {
  Other(&'static str),
  Validation(String),
  Unimplemented(SpecCommand),
}

impl std::fmt::Display for SpecCommandError {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    f.write_str(&self.to_string())
  }
}

impl std::error::Error for SpecCommandError {}
