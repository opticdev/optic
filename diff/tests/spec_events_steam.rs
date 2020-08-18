use optic_diff::events::from_file;

#[test]
fn can_read_json() {
  from_file(
    std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/ergast-example-spec.json")
      .to_str()
      .unwrap(),
  )
  .unwrap();
}
