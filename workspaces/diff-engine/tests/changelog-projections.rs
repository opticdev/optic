use optic_diff_engine::{SpecEvent, ChangelogProjection, ChangelogQuery};
use chrono::Utc;
use insta::assert_debug_snapshot;

#[test]
fn empty_events_gives_empty_projection() {
  let spec_events: Vec<SpecEvent> = Default::default();
  let changelog_projection = ChangelogProjection::from(spec_events);
  assert_debug_snapshot!(changelog_projection);
}

#[test]
fn can_query_empty_projection_for_added_endpoints() {
  let spec_events: Vec<SpecEvent> = Default::default();
  let changelog_projection = ChangelogProjection::from(spec_events);
  let changelog_query = ChangelogQuery{changelog: changelog_projection};
  assert_debug_snapshot!(changelog_query.added(Utc::now()));
}

#[test]
fn can_query_empty_projection_for_changed_endpoints() {
  let spec_events: Vec<SpecEvent> = Default::default();
  let changelog_projection = ChangelogProjection::from(spec_events);
  let changelog_query = ChangelogQuery{changelog: changelog_projection};
  assert_debug_snapshot!(changelog_query.changed(Utc::now()));
}