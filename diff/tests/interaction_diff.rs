use cqrs_core::Aggregate;
use optic_diff::events::SpecEvent;
use optic_diff::projections::endpoint::EndpointProjection;

#[test]
fn can_yield_diff_results() {
  let events = SpecEvent::from_file(
    std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/ergast-example-spec.json")
      .to_str()
      .unwrap(),
  )
  .expect("example spec should deserialize");

  let mut events_projection = EndpointProjection::default();

  for event in events {
    events_projection.apply(event)
  }
}
