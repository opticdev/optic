use optic_diff::HttpInteraction;
use std::fs::File;

#[test]
fn can_read_avro_serialized_interactions() {
  let fd = File::open(
    std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/ergast-captures/0.optic-capture.avro")
      .to_str()
      .unwrap(),
  )
  .expect("test capture file should be readable");

  let interactions: Vec<_> = HttpInteraction::from_avro()
    .reader(fd)
    .expect("interactions from capture should deserialize")
    .collect();

  assert!(interactions.len() > 0);
}
