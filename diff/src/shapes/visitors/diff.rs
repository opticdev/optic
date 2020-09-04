use super::{JlasPrimitiveVisitor, JsonBodyVisitor, JsonBodyVisitors, VisitorResults};
use crate::queries::shape::ChoiceOutput;
use crate::shapes::ShapeDiffResult;
use crate::shapes::{JsonTrail, ShapeTrail};
use crate::state::shape::ShapeKind;
use serde_json::Value as JsonValue;

pub struct DiffVisitors {
  primitive: DiffPrimitiveVisitor,
}

type DiffResults = VisitorResults<ShapeDiffResult>;

pub struct DiffPrimitiveVisitor {
  results: DiffResults,
}

impl JsonBodyVisitor<ShapeDiffResult> for DiffPrimitiveVisitor {
  fn results(&mut self) -> Option<&mut DiffResults> {
    Some(&mut self.results)
  }
}

impl JlasPrimitiveVisitor<ShapeDiffResult> for DiffPrimitiveVisitor {
  fn visit(
    &mut self,
    json: JsonValue,
    json_trail: JsonTrail,
    trail_origin: ShapeTrail,
    trail_choices: Vec<ChoiceOutput>,
  ) {
    if trail_choices.is_empty() {
      self.results.push(ShapeDiffResult::UnspecifiedShape {
        json_trail,
        shape_trail: trail_origin,
      });
      return;
    }

    let (matched, unmatched): (Vec<&ChoiceOutput>, Vec<&ChoiceOutput>) =
      trail_choices.iter().partition(|choice| match &json {
        JsonValue::Bool(x) => match choice.core_shape_kind {
          ShapeKind::BooleanKind => true,
          _ => false,
        },
        JsonValue::Number(x) => match choice.core_shape_kind {
          ShapeKind::NumberKind => true,
          _ => false,
        },
        JsonValue::String(x) => match choice.core_shape_kind {
          ShapeKind::StringKind => true,
          _ => false,
        },
        JsonValue::Null => match choice.core_shape_kind {
          ShapeKind::NullableKind => true,
          _ => false,
        },
        _ => unreachable!("should not call primitive visitor without a json primitive value"),
      });
    if matched.is_empty() {
      unmatched.iter().for_each(|&choice| {
        self.results.push(ShapeDiffResult::UnmatchedShape {
          json_trail: json_trail.clone(),
          shape_trail: choice.shape_trail(),
        });
      });
    }
  }
}
