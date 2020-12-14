use optic_diff_engine::SpecEvent;

#[test]
fn can_read_json() {
  SpecEvent::from_file(
    std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/ergast-example-spec.json")
      .to_str()
      .unwrap(),
  )
  .unwrap();
}
