pub use serde::Deserialize;

pub mod endpoint;
pub mod rfc;
pub mod shape;

#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum SpecCommand {
  EndpointCommand(endpoint::EndpointCommand),
  RfcCommand(rfc::RfcCommand),
  ShapeCommand(shape::ShapeCommand),
}
