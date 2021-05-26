use cqrs_core::{Aggregate, AggregateEvent, Event};
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use std::iter::FromIterator;

use crate::interactions::{BodyAnalysisLocation, BodyAnalysisResult, InteractionDiffResult};
use crate::learn_shape::{TrailObservationsResult, TrailValues};
use crate::shapes::JsonTrail;
use crate::state::{TaggedInput, Tags};

#[derive(Default, Debug)]
pub struct LearnedShapeDiffAffordancesProjection {
  diffs_by_spec_id: HashMap<String, Vec<InteractionDiffResult>>,
  affordances_by_diff_fingerprint: HashMap<String, ShapeDiffAffordances>,
}

impl LearnedShapeDiffAffordancesProjection {
  fn with_body_analysis_result(
    &mut self,
    (analysis, interaction_pointers): (BodyAnalysisResult, InteractionPointers),
  ) {
    let diffs_by_spec_id = &self.diffs_by_spec_id;
    let affordances_by_diff_fingerprint = &mut self.affordances_by_diff_fingerprint;

    let spec_id = match analysis.body_location {
      BodyAnalysisLocation::MatchedRequest { request_id, .. } => Some(request_id),
      BodyAnalysisLocation::MatchedResponse { response_id, .. } => Some(response_id),
      _ => None,
    };

    let diffs = spec_id
      .into_iter()
      .flat_map(|spec_id| diffs_by_spec_id.get(&spec_id).into_iter().flatten());

    for diff in diffs {
      let diff_json_trail = diff.json_trail().unwrap();
      let normalized_diff_trail = diff_json_trail.normalized();
      let all_observations = &analysis.trail_observations;

      let observed_relevant_trails: HashSet<_> = all_observations
        .trails()
        .filter(|observed_trail| {
          let normalized_observed = observed_trail.normalized();
          normalized_observed == normalized_diff_trail
            || normalized_observed.is_descendant_of(&normalized_diff_trail)
        })
        .cloned()
        .collect();

      let expected_trails: HashSet<_> = all_observations
        .trails()
        .filter(|observed_trail| {
          let normalized_observed = observed_trail.normalized();
          normalized_diff_trail.is_child_of(&normalized_observed)
        })
        .map(|parent_trail| {
          parent_trail.with_component(
            diff_json_trail
              .last_component()
              .expect("for a json trail to be a child of another, it must have a last component")
              .clone(),
          )
        })
        .collect();

      let trail_results =
        observed_relevant_trails
          .union(&expected_trails)
          .filter_map(|relevant_trail| {
            all_observations.get(relevant_trail).cloned().or_else(|| {
              // only generate empty observations for trails with object parents
              let parent_trail = {
                let mut trail = relevant_trail.clone();
                trail.pop();
                trail
              };

              all_observations
                .get(&parent_trail)
                .filter(|parent_observation| parent_observation.was_object)
                .map(|_| TrailValues::from(relevant_trail.clone()))
            })
          });

      let fingerprint = diff.fingerprint();

      let affordances = affordances_by_diff_fingerprint
        .entry(fingerprint)
        .or_insert_with(|| ShapeDiffAffordances::from(diff_json_trail.clone()));

      for trail_result in trail_results {
        affordances.push((trail_result.clone(), interaction_pointers.clone()));
      }
    }
  }
}

// allows iterator.collect() right into this projection
impl FromIterator<InteractionDiffResult> for LearnedShapeDiffAffordancesProjection {
  fn from_iter<I: IntoIterator<Item = InteractionDiffResult>>(diff_results: I) -> Self {
    let unique_diffs: HashMap<String, _> = diff_results
      .into_iter()
      .map(|diff_result| (diff_result.fingerprint(), diff_result))
      .collect();

    let mut diffs_by_spec_id = HashMap::new();
    for (fingerprint, diff_result) in unique_diffs {
      let spec_id = match &diff_result {
        InteractionDiffResult::UnmatchedRequestBodyShape(diff) => diff
          .requests_trail
          .get_request_id()
          .expect("UnmatchedRequestBodyShape should have a request id in the requests trail"),
        InteractionDiffResult::UnmatchedResponseBodyShape(diff) => diff
          .requests_trail
          .get_response_id()
          .expect("UnmatchedResponseBodyShape should have a response id in the requests trail"),
        _ => continue, // filter out diffs we don't care about
      }
      .clone();

      diffs_by_spec_id
        .entry(spec_id)
        .or_insert_with(|| vec![])
        .push(diff_result);
    }

    Self {
      diffs_by_spec_id,
      affordances_by_diff_fingerprint: HashMap::new(),
    }
  }
}

impl From<Vec<InteractionDiffResult>> for LearnedShapeDiffAffordancesProjection {
  fn from(diff_results: Vec<InteractionDiffResult>) -> Self {
    diff_results.into_iter().collect()
  }
}

// easy consuming of the results in a for loop
impl IntoIterator for LearnedShapeDiffAffordancesProjection {
  type Item = (String, ShapeDiffAffordances);
  type IntoIter = std::collections::hash_map::IntoIter<String, ShapeDiffAffordances>;

  fn into_iter(self) -> Self::IntoIter {
    self.affordances_by_diff_fingerprint.into_iter()
  }
}

impl Aggregate for LearnedShapeDiffAffordancesProjection {
  fn aggregate_type() -> &'static str {
    "learned_shaped_diff_affordances_projection"
  }
}

impl Event for TaggedInput<BodyAnalysisResult> {
  fn event_type(&self) -> &'static str {
    "body_analysis_result_with_interaction_pointers"
  }
}

impl AggregateEvent<LearnedShapeDiffAffordancesProjection> for TaggedInput<BodyAnalysisResult> {
  fn apply_to(self, aggregate: &mut LearnedShapeDiffAffordancesProjection) {
    let (analysis, interaction_pointers) = self.into_parts();
    aggregate.with_body_analysis_result((analysis, interaction_pointers));
  }
}

// Output structs
// ------------

#[derive(Debug, Serialize)]
pub struct ShapeDiffAffordances {
  affordances: Vec<TrailValues>,
  interactions: InteractionsAffordances,

  #[serde(skip)]
  root_trail: JsonTrail,
}
pub type InteractionPointers = Tags;

#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InteractionsAffordances {
  was_string: InteractionPointers,
  was_number: InteractionPointers,
  was_boolean: InteractionPointers,
  was_null: InteractionPointers,
  was_array: InteractionPointers,
  was_empty_array: InteractionPointers,
  was_object: InteractionPointers,
  was_missing: InteractionPointers,
  was_string_trails: HashMap<String, HashSet<JsonTrail>>,
  was_number_trails: HashMap<String, HashSet<JsonTrail>>,
  was_boolean_trails: HashMap<String, HashSet<JsonTrail>>,
  was_null_trails: HashMap<String, HashSet<JsonTrail>>,
  was_array_trails: HashMap<String, HashSet<JsonTrail>>,
  was_empty_array_trails: HashMap<String, HashSet<JsonTrail>>,
  was_object_trails: HashMap<String, HashSet<JsonTrail>>,
  was_missing_trails: HashMap<String, HashSet<JsonTrail>>,
}

impl From<JsonTrail> for ShapeDiffAffordances {
  fn from(root_trail: JsonTrail) -> Self {
    Self {
      affordances: vec![],
      interactions: InteractionsAffordances::default(),
      root_trail,
    }
  }
}

impl ShapeDiffAffordances {
  pub fn push(&mut self, (mut trail_values, pointers): (TrailValues, InteractionPointers)) {
    let new_trail = &trail_values.trail;
    let new_trail_normalized = new_trail.normalized();
    if new_trail_normalized == self.root_trail.normalized() {
      // track the interaction pointers only by the normalized root trail,
      // but per interaction denormalized (so per interaction we can identify which array
      // item the diff occurred in)
      self.interactions.push((&trail_values, pointers));
    }

    if let Some(current_affordances) = self
      .affordances
      .iter_mut()
      .find(|trail_affordances| trail_affordances.trail == new_trail_normalized)
    {
      current_affordances.union(trail_values);
    } else {
      trail_values.normalize();
      self.affordances.push(trail_values);
    }
  }
}

impl InteractionsAffordances {
  pub fn push(&mut self, (trail_values, pointers): (&TrailValues, InteractionPointers)) {
    let json_trail = trail_values.trail.clone();
    let add_trail = |collection: &mut HashMap<String, HashSet<JsonTrail>>| {
      for pointer in &pointers {
        let existing_trails = collection
          .entry(pointer.clone())
          .or_insert_with(|| HashSet::new());

        existing_trails.insert(json_trail.clone());
      }
    };

    if trail_values.was_string {
      self.was_string.extend(pointers.clone());
      add_trail(&mut self.was_string_trails);
    }
    if trail_values.was_number {
      self.was_number.extend(pointers.clone());
      add_trail(&mut self.was_number_trails);
    }
    if trail_values.was_null {
      self.was_null.extend(pointers.clone());
      add_trail(&mut self.was_null_trails);
    }
    if trail_values.was_array {
      self.was_array.extend(pointers.clone());
      add_trail(&mut self.was_array_trails);
    }
    if trail_values.was_empty_array {
      self.was_empty_array.extend(pointers.clone());
      add_trail(&mut self.was_empty_array_trails);
    }
    if trail_values.was_object {
      self.was_object.extend(pointers.clone());
      add_trail(&mut self.was_object_trails);
    }
    if trail_values.was_unknown() {
      self.was_missing.extend(pointers.clone());
      add_trail(&mut self.was_missing_trails);
    }
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use crate::interactions::InteractionDiffResult;
  use crate::learn_shape::observe_body_trails;
  use crate::state::body::BodyDescriptor;
  use insta::assert_debug_snapshot;
  use serde_json::json;

  #[test]
  fn shape_diff_affordances_can_aggregate_affordances_for_array_item_diffs() {
    let body = BodyDescriptor::from(json!({
      "items": [132, "string-array-item"],
      "other-field": true
    }));
    let interaction_pointer = String::from("test-interaction-0");

    // shape diff for items[1] being a string
    let array_item_shape_diff : InteractionDiffResult = serde_json::from_value(json!({
      "UnmatchedResponseBodyShape":{
        "interactionTrail":{"path":[{"ResponseBody":{"contentType":"application/json","statusCode":200}}]},
        "requestsTrail":{"SpecResponseBody":{"responseId":"test-response-1"}},
        "shapeDiffResult":{"UnmatchedShape":{
          "jsonTrail":{"path":[{"JsonObjectKey":{"key":"items"}},{"JsonArrayItem":{"index":1}}] },
          "shapeTrail":{"rootShapeId":"some_shape_id","path":[{"ObjectFieldTrail":{"fieldId":"field_1","fieldShapeId":"shape_L3dn1UwIbE","parentObjectShapeId":"some_shape_id"}},{"ListItemTrail":{"listShapeId":"shape_2","itemShapeId":"item_shape_id_2"}}]}
        }}
      }
    })).unwrap();
    let diff_fingerprint = array_item_shape_diff.fingerprint();

    let analysis_result = BodyAnalysisResult {
      body_location: BodyAnalysisLocation::MatchedResponse {
        response_id: String::from("test-response-1"),
        content_type: Some(String::from("application/json")),
        status_code: 200,
      },
      trail_observations: observe_body_trails(body),
    };

    let interaction_pointers: Tags = vec![interaction_pointer.clone()].into_iter().collect();
    let tagged_analysis = TaggedInput(analysis_result, interaction_pointers);

    let mut projection = LearnedShapeDiffAffordancesProjection::from(vec![array_item_shape_diff]);

    projection.apply(tagged_analysis);

    let mut results: Vec<_> = projection.into_iter().collect();
    assert_eq!(results.len(), 1); // one diff, one result per diff

    let (aggregate_key, shape_diff_affordances) = results.pop().unwrap();
    assert_eq!(aggregate_key, diff_fingerprint); // per diff fingerprint

    // affordances
    assert_eq!(
      &shape_diff_affordances.affordances[0].trail,
      &JsonTrail::empty()
        .with_object_key(String::from("items"))
        .with_array_item(0),
      "affordance trail is normalized"
    );
    assert!(
      shape_diff_affordances.affordances[0].was_string
        && shape_diff_affordances.affordances[0].was_number
    );

    // interactions
    let was_string_trails = &shape_diff_affordances.interactions.was_string_trails;
    assert!(
      &was_string_trails
        .get(&interaction_pointer)
        .unwrap()
        .contains(
          &JsonTrail::empty()
            .with_object_key(String::from("items"))
            .with_array_item(1)
        ),
      "interaction affordance trails are denormalized"
    );

    assert_debug_snapshot!("shape_diff_affordances_can_aggregate_affordances_for_array_item_diffs__shape_diff_affordances", shape_diff_affordances);
  }
  #[test]
  fn shape_diff_affordances_can_aggregate_affordances_for_deeply_nested_missing_fields() {
    let body_with_object_parent = BodyDescriptor::from(json!({
      "races": [{
        "results": [{ "time": "1:03:04" }, { "time": "1:03:12" }],
      }, {
        "results": [{ "time": "1:48:53" }, {}]
      }],
    }));

    let body_with_string_parent = BodyDescriptor::from(json!({
      "races": [{
        "results": [{ "time": "1:03:04" }, { "time": "1:03:12" }],
      }, {
        "results": [{ "time": "1:48:53" }, "1:40:22" ]
      }],
    }));

    let with_object_parent_interaction_pointer = String::from("test-interaction-0");
    let with_string_parent_interaction_pointer = String::from("test-interaction-1");

    // shape diff for races[1].results[1].time being missing
    let shape_diff : InteractionDiffResult = serde_json::from_value(json!({
        "UnmatchedResponseBodyShape":{
          "interactionTrail":{"path":[{"ResponseBody":{"contentType":"application/json","statusCode":200}}]},
          "requestsTrail":{"SpecResponseBody":{"responseId":"test-response-1"}},
          "shapeDiffResult":{"UnmatchedShape":{
            "jsonTrail":{"path":[{"JsonObjectKey":{"key":"races"}},{"JsonArrayItem":{"index":1}},{"JsonObjectKey":{"key":"results"}},{"JsonArrayItem":{"index":1}},{"JsonObjectKey":{"key":"time"}}] },
            "shapeTrail":{"rootShapeId":"some_shape_id","path":[]}
          }}
        }
      })).unwrap();

    let diff_fingerprint = shape_diff.fingerprint();

    let analysis_with_object_parent = {
      let analysis_result = BodyAnalysisResult {
        body_location: BodyAnalysisLocation::MatchedResponse {
          response_id: String::from("test-response-1"),
          content_type: Some(String::from("application/json")),
          status_code: 200,
        },
        trail_observations: observe_body_trails(body_with_object_parent),
      };
      let interaction_pointers: Tags = vec![with_object_parent_interaction_pointer.clone()]
        .into_iter()
        .collect();
      TaggedInput(analysis_result, interaction_pointers)
    };

    let analysis_with_string_parent = {
      let analysis_result = BodyAnalysisResult {
        body_location: BodyAnalysisLocation::MatchedResponse {
          response_id: String::from("test-response-1"),
          content_type: Some(String::from("application/json")),
          status_code: 200,
        },
        trail_observations: observe_body_trails(body_with_string_parent),
      };
      let interaction_pointers: Tags = vec![with_string_parent_interaction_pointer.clone()]
        .into_iter()
        .collect();
      TaggedInput(analysis_result, interaction_pointers)
    };

    let mut projection = LearnedShapeDiffAffordancesProjection::from(vec![shape_diff]);

    projection.apply(analysis_with_object_parent);
    projection.apply(analysis_with_string_parent);

    let mut results: Vec<_> = projection.into_iter().collect();
    assert_eq!(results.len(), 1); // one diff, one result per diff

    let (aggregate_key, shape_diff_affordances) = results.pop().unwrap();
    assert_eq!(aggregate_key, diff_fingerprint); // per diff fingerprint

    let was_missing = &shape_diff_affordances.interactions.was_missing;
    assert!(was_missing.contains(&with_object_parent_interaction_pointer));

    let was_missing_trails = &shape_diff_affordances.interactions.was_missing_trails;
    assert!(
      &was_missing_trails
        .get(&with_object_parent_interaction_pointer)
        .unwrap()
        .contains(
          &JsonTrail::empty()
            .with_object_key(String::from("races"))
            .with_array_item(1)
            .with_object_key(String::from("results"))
            .with_array_item(1)
            .with_object_key(String::from("time"))
        ),
      "trails where expected shapes were missing are recorded"
    );

    assert!(
      !was_missing.contains(&with_string_parent_interaction_pointer),
      "non-object parent bodies do not have children registered as missing"
    );
    assert!(&was_missing_trails
      .get(&with_string_parent_interaction_pointer)
      .is_none());
  }

  #[test]
  fn shape_diff_affordances_can_aggregate_affordances_for_observed_object_bodies() {
    let body = BodyDescriptor::from(json!({
      "some-field": "a-string-value",
    }));

    let interaction_pointer = String::from("test-interaction-0");

    // shape diff for races[1].results[1].time being missing
    let shape_diff : InteractionDiffResult = serde_json::from_value(json!({
        "UnmatchedResponseBodyShape":{
          "interactionTrail":{"path":[{"ResponseBody":{"contentType":"application/json","statusCode":200}}]},
          "requestsTrail":{"SpecResponseBody":{"responseId":"test-response-1"}},
          "shapeDiffResult":{"UnmatchedShape":{
            "jsonTrail":{"path":[] },
            "shapeTrail":{"rootShapeId":"some_shape_id","path":[]}
          }}
        }
      })).unwrap();

    let diff_fingerprint = shape_diff.fingerprint();

    let analysis_result = BodyAnalysisResult {
      body_location: BodyAnalysisLocation::MatchedResponse {
        response_id: String::from("test-response-1"),
        content_type: Some(String::from("application/json")),
        status_code: 200,
      },
      trail_observations: observe_body_trails(body),
    };

    let interaction_pointers: Tags = vec![interaction_pointer.clone()].into_iter().collect();
    let tagged_analysis = TaggedInput(analysis_result, interaction_pointers);

    let mut projection = LearnedShapeDiffAffordancesProjection::from(vec![shape_diff]);

    projection.apply(tagged_analysis);

    let mut results: Vec<_> = projection.into_iter().collect();
    assert_eq!(results.len(), 1); // one diff, one result per diff

    let (aggregate_key, shape_diff_affordances) = results.pop().unwrap();
    assert_eq!(aggregate_key, diff_fingerprint); // per diff fingerprint

    assert!(&shape_diff_affordances.interactions.was_string.is_empty());
    assert!(&shape_diff_affordances.interactions.was_number.is_empty());
    assert!(&shape_diff_affordances.interactions.was_boolean.is_empty());
    assert!(&shape_diff_affordances.interactions.was_null.is_empty());
    assert!(&shape_diff_affordances.interactions.was_array.is_empty());
    assert!(&shape_diff_affordances.interactions.was_missing.is_empty());

    let was_object = &shape_diff_affordances.interactions.was_object;
    assert!(was_object.contains(&interaction_pointer));

    let was_object_trails = &shape_diff_affordances.interactions.was_object_trails;
    assert!(
      &was_object_trails
        .get(&interaction_pointer)
        .unwrap()
        .contains(&JsonTrail::empty()),
      "trails where expected shapes were objects are recorded"
    );
  }

  #[test]
  fn shape_diff_affordances_records_which_arrays_were_empty() {
    let body = BodyDescriptor::from(json!([[1, 2, 3], []]));

    let interaction_pointer = String::from("test-interaction-0");

    // shape diff for root array items
    let shape_diff : InteractionDiffResult = serde_json::from_value(json!({
        "UnmatchedResponseBodyShape":{
          "interactionTrail":{"path":[{"ResponseBody":{"contentType":"application/json","statusCode":200}}]},
          "requestsTrail":{"SpecResponseBody":{"responseId":"test-response-1"}},
          "shapeDiffResult":{"UnmatchedShape":{
            "jsonTrail":{"path":[{"JsonArrayItem":{"index":0}}] },
            "shapeTrail":{"rootShapeId":"some_shape_id","path":[]}
          }}
        }
      })).unwrap();

    let diff_fingerprint = shape_diff.fingerprint();

    let analysis_result = BodyAnalysisResult {
      body_location: BodyAnalysisLocation::MatchedResponse {
        response_id: String::from("test-response-1"),
        content_type: Some(String::from("application/json")),
        status_code: 200,
      },
      trail_observations: observe_body_trails(body),
    };

    let interaction_pointers: Tags = vec![interaction_pointer.clone()].into_iter().collect();
    let tagged_analysis = TaggedInput(analysis_result, interaction_pointers);

    let mut projection = LearnedShapeDiffAffordancesProjection::from(vec![shape_diff]);

    projection.apply(tagged_analysis);

    let mut results: Vec<_> = projection.into_iter().collect();
    assert_eq!(results.len(), 1); // one diff, one result per diff

    let (aggregate_key, shape_diff_affordances) = results.pop().unwrap();
    assert_eq!(aggregate_key, diff_fingerprint); // per diff fingerprint

    assert!(&shape_diff_affordances.interactions.was_string.is_empty());
    assert!(&shape_diff_affordances.interactions.was_number.is_empty());
    assert!(&shape_diff_affordances.interactions.was_boolean.is_empty());
    assert!(&shape_diff_affordances.interactions.was_null.is_empty());
    assert!(&shape_diff_affordances.interactions.was_object.is_empty());
    assert!(&shape_diff_affordances.interactions.was_missing.is_empty());

    let was_array = &shape_diff_affordances.interactions.was_array;
    let was_empty_array = &shape_diff_affordances.interactions.was_empty_array;

    assert!(was_array.contains(&interaction_pointer));
    assert!(was_empty_array.contains(&interaction_pointer));

    let was_array_trails = &shape_diff_affordances.interactions.was_array_trails;
    let was_empty_array_trails = &shape_diff_affordances.interactions.was_empty_array_trails;

    assert!(
      &was_array_trails
        .get(&interaction_pointer)
        .unwrap()
        .contains(&JsonTrail::empty().with_array_item(0)),
      "non-empty arrays are recorded as array trails"
    );
    assert!(
      &was_array_trails
        .get(&interaction_pointer)
        .unwrap()
        .contains(&JsonTrail::empty().with_array_item(1)),
      "empty arrays are recorded as array trails"
    );
    assert!(
      !&was_empty_array_trails
        .get(&interaction_pointer)
        .unwrap()
        .contains(&JsonTrail::empty().with_array_item(0)),
      "non-empty arrays are not recorded as array trails"
    );
    assert!(
      &was_empty_array_trails
        .get(&interaction_pointer)
        .unwrap()
        .contains(&JsonTrail::empty().with_array_item(1)),
      "empty arrays are recorded as array trails"
    );
  }
}
