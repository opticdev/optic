use optic_diff_engine::{SpecEvent, ChangelogProjection, ChangelogQuery};
use chrono::{DateTime, Utc, TimeZone};
use insta::assert_debug_snapshot;

fn setup_empty_changelog() -> ChangelogProjection {
  let spec_events: Vec<SpecEvent> = Default::default();
  ChangelogProjection::from(spec_events)
}

fn setup_changelog_with_added() -> ChangelogProjection {
  let file = std::env::current_dir().unwrap().join("tests/fixtures/ergast-example-spec.json");
  let spec_events: Vec<SpecEvent> = SpecEvent::from_file(file).expect("ergast spec deserialize");
  ChangelogProjection::from(spec_events)
}

fn setup_query(changelog: ChangelogProjection) -> ChangelogQuery {
  ChangelogQuery{changelog: changelog}
}

fn setup_all_time() -> DateTime<Utc> {
  Utc.timestamp(0, 0)
}

fn setup_some_time() -> DateTime<Utc> {
  "2020-04-08T09:28:13.358Z".parse::<DateTime<Utc>>().expect("utc time")
}

fn setup_no_time() -> DateTime<Utc> {
  Utc::now()
}

#[test]
fn empty_changelog_can_query_added_endpoints() {
  let query = setup_query(setup_empty_changelog());
  assert_debug_snapshot!(query.added(setup_all_time()));
}

#[test]
fn changelog_with_added_events_can_query_added_endpoints_all_time() {
  let query = setup_query(setup_changelog_with_added());
  assert_debug_snapshot!(query.added(setup_all_time()));
}

#[test]
fn changelog_with_added_events_can_query_added_endpoints_some_time() {
  let query = setup_query(setup_changelog_with_added());
  assert_debug_snapshot!(query.added(setup_some_time()));
}

#[test]
fn changelog_with_added_events_can_query_added_endpoints_no_time() {
  let query = setup_query(setup_changelog_with_added());
  assert_debug_snapshot!(query.added(setup_no_time()));
}