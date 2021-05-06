use cqrs_core::{Aggregate, AggregateEvent, Event};
use serde::Serialize;
use std::collections::HashMap;
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
      let all_observations = &analysis.trail_observations;
      let trail_results = all_observations
        .trails()
        .filter(|observed_trail| {
          **observed_trail == *diff_json_trail || observed_trail.is_child_of(diff_json_trail)
        })
        .map(|relevant_trail| {
          all_observations
            .get(relevant_trail)
            .cloned()
            .unwrap_or_else(|| TrailValues::new(relevant_trail))
        });

      let fingerprint = diff.fingerprint();

      let affordances = affordances_by_diff_fingerprint
        .entry(fingerprint)
        .or_insert_with(|| ShapeDiffAffordances::from(diff_json_trail.clone()));

      for trail_result in trail_results {
        affordances.push((trail_result, interaction_pointers.clone()));
      }
    }
  }
}

// allows iterator.collect() right into this projection
impl FromIterator<InteractionDiffResult> for LearnedShapeDiffAffordancesProjection {
  fn from_iter<I: IntoIterator<Item = InteractionDiffResult>>(diff_results: I) -> Self {
    let mut diffs_by_spec_id = HashMap::new();
    for diff_result in diff_results {
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
  was_object: InteractionPointers,
  was_missing: InteractionPointers,
  was_string_trails: HashMap<String, Vec<JsonTrail>>,
  was_number_trails: HashMap<String, Vec<JsonTrail>>,
  was_boolean_trails: HashMap<String, Vec<JsonTrail>>,
  was_null_trails: HashMap<String, Vec<JsonTrail>>,
  was_array_trails: HashMap<String, Vec<JsonTrail>>,
  was_object_trails: HashMap<String, Vec<JsonTrail>>,
  was_missing_trails: HashMap<String, Vec<JsonTrail>>,
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
  pub fn push(&mut self, (trail_values, pointers): (TrailValues, InteractionPointers)) {
    let new_trail = &trail_values.trail;
    if *new_trail == self.root_trail {
      // track the interaction pointers only by the root trail
      self.interactions.push((&trail_values, pointers));
    }

    if let Some(current_affordances) = self
      .affordances
      .iter_mut()
      .find(|trail_affordances| trail_affordances.trail == *new_trail)
    {
      current_affordances.union(trail_values);
    } else {
      self.affordances.push(trail_values);
    }
  }
}

impl InteractionsAffordances {
  pub fn push(&mut self, (trail_values, pointers): (&TrailValues, InteractionPointers)) {
    let json_trail = trail_values.trail.clone();
    let json_trails_by_pointer_iter = || {
      pointers
        .iter()
        .map(|pointer| (pointer.clone(), vec![json_trail.clone()]))
    };
    if trail_values.was_string {
      self.was_string.extend(pointers.clone());
      self.was_string_trails.extend(json_trails_by_pointer_iter());
    }
    if trail_values.was_number {
      self.was_number.extend(pointers.clone());
      self.was_number_trails.extend(json_trails_by_pointer_iter());
    }
    if trail_values.was_null {
      self.was_null.extend(pointers.clone());
      self.was_null_trails.extend(json_trails_by_pointer_iter());
    }
    if trail_values.was_array {
      self.was_array.extend(pointers.clone());
      self.was_array_trails.extend(json_trails_by_pointer_iter());
    }
    if trail_values.was_object {
      self.was_object.extend(pointers.clone());
      self.was_object_trails.extend(json_trails_by_pointer_iter());
    }
    if trail_values.was_unknown() {
      self.was_missing.extend(pointers.clone());
      self
        .was_missing_trails
        .extend(json_trails_by_pointer_iter());
    }
  }
}
