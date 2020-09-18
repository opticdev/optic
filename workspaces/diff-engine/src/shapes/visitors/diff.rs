use super::{
  JlasArrayVisitor, JlasObjectKeyVisitor, JlasObjectVisitor, JlasPrimitiveVisitor, JsonBodyVisitor,
  JsonBodyVisitors, VisitorResults,
};
use crate::queries::shape::ChoiceOutput;
use crate::shapes::ShapeDiffResult;
use crate::shapes::{JsonTrail, JsonTrailPathComponent, ShapeTrail, ShapeTrailPathComponent};
use crate::state::shape::{FieldId, ShapeId, ShapeKind};
use serde_json::Value as JsonValue;

pub struct DiffVisitors {
  array: DiffArrayVisitor,
  object: DiffObjectVisitor,
  object_key: DiffObjectKeyVisitor,
  primitive: DiffPrimitiveVisitor,
}

impl DiffVisitors {
  pub fn new() -> Self {
    DiffVisitors {
      array: DiffArrayVisitor::new(),
      object: DiffObjectVisitor::new(),
      object_key: DiffObjectKeyVisitor::new(),
      primitive: DiffPrimitiveVisitor::new(),
    }
  }
}

type DiffResults = VisitorResults<ShapeDiffResult>;

impl JsonBodyVisitors<ShapeDiffResult> for DiffVisitors {
  type Array = DiffArrayVisitor;
  type Object = DiffObjectVisitor;
  type ObjectKey = DiffObjectKeyVisitor;
  type Primitive = DiffPrimitiveVisitor;

  fn array(&mut self) -> &mut DiffArrayVisitor {
    &mut self.array
  }

  fn object(&mut self) -> &mut DiffObjectVisitor {
    &mut self.object
  }

  fn object_key(&mut self) -> &mut DiffObjectKeyVisitor {
    &mut self.object_key
  }

  fn primitive(&mut self) -> &mut DiffPrimitiveVisitor {
    &mut self.primitive
  }
}

// Primitive visitor
// -----------------

pub struct DiffPrimitiveVisitor {
  results: DiffResults,
}

impl DiffPrimitiveVisitor {
  pub fn new() -> Self {
    Self {
      results: DiffResults::new(),
    }
  }
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
    trail_choices: &Vec<ChoiceOutput>,
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

// Array visitor
// -------------

pub struct DiffArrayVisitor {
  results: DiffResults,
}

impl DiffArrayVisitor {
  pub fn new() -> Self {
    Self {
      results: DiffResults::new(),
    }
  }
}

impl JsonBodyVisitor<ShapeDiffResult> for DiffArrayVisitor {
  fn results(&mut self) -> Option<&mut DiffResults> {
    Some(&mut self.results)
  }
}

impl JlasArrayVisitor<ShapeDiffResult> for DiffArrayVisitor {
  fn visit(
    &mut self,
    json: &JsonValue,
    json_trail: &JsonTrail,
    trail_origin: &ShapeTrail,
    trail_choices: &Vec<ChoiceOutput>,
  ) -> Vec<ChoiceOutput> {
    if trail_choices.is_empty() {
      self.results.push(ShapeDiffResult::UnspecifiedShape {
        json_trail: json_trail.clone(),
        shape_trail: trail_origin.clone(),
      });
      return vec![];
    }

    let (matched, unmatched): (Vec<&ChoiceOutput>, Vec<&ChoiceOutput>) =
      trail_choices.into_iter().partition(|choice| match json {
        JsonValue::Array(_) => match choice.core_shape_kind {
          ShapeKind::ListKind => true,
          _ => false,
        },
        _ => unreachable!("should only call array visitor for array json types"),
      });

    if matched.is_empty() {
      unmatched.into_iter().for_each(|choice| {
        self.results.push(ShapeDiffResult::UnmatchedShape {
          json_trail: json_trail.clone(),
          shape_trail: choice.shape_trail(),
        });
      });
    }

    matched.into_iter().map(|x| (*x).clone()).collect()
  }
}

// Object visitor
// -------------

pub struct DiffObjectVisitor {
  results: DiffResults,
}

impl DiffObjectVisitor {
  pub fn new() -> Self {
    Self {
      results: DiffResults::new(),
    }
  }
}

impl JsonBodyVisitor<ShapeDiffResult> for DiffObjectVisitor {
  fn results(&mut self) -> Option<&mut DiffResults> {
    Some(&mut self.results)
  }
}

impl JlasObjectVisitor<ShapeDiffResult> for DiffObjectVisitor {
  fn visit(
    &mut self,
    json: &JsonValue,
    json_trail: &JsonTrail,
    trail_origin: &ShapeTrail,
    trail_choices: &Vec<ChoiceOutput>,
  ) -> Vec<ChoiceOutput> {
    if trail_choices.is_empty() {
      self.results.push(ShapeDiffResult::UnspecifiedShape {
        json_trail: json_trail.clone(),
        shape_trail: trail_origin.clone(),
      });
      return vec![];
    }

    let (matched, unmatched): (Vec<&ChoiceOutput>, Vec<&ChoiceOutput>) =
      trail_choices.into_iter().partition(|choice| match json {
        JsonValue::Object(_) => match choice.core_shape_kind {
          ShapeKind::ObjectKind => true,
          _ => false,
        },
        _ => unreachable!("should only call object visitor for object json types"),
      });

    if matched.is_empty() {
      unmatched.into_iter().for_each(|choice| {
        self.results.push(ShapeDiffResult::UnmatchedShape {
          json_trail: json_trail.clone(),
          shape_trail: choice.shape_trail(),
        });
      });
    }

    matched.into_iter().map(|x| (*x).clone()).collect()
  }
}

// Object Key visitor
// ------------------

pub struct DiffObjectKeyVisitor {
  results: DiffResults,
}

impl DiffObjectKeyVisitor {
  pub fn new() -> Self {
    Self {
      results: DiffResults::new(),
    }
  }
}

impl JsonBodyVisitor<ShapeDiffResult> for DiffObjectKeyVisitor {
  fn results(&mut self) -> Option<&mut DiffResults> {
    Some(&mut self.results)
  }
}

impl JlasObjectKeyVisitor<ShapeDiffResult> for DiffObjectKeyVisitor {
  fn visit(
    &mut self,
    object_json_trail: &JsonTrail,
    object_keys: &Vec<String>,
    object_and_field_choices: &Vec<(&ChoiceOutput, Vec<(String, FieldId, ShapeId)>)>,
  ) {
    object_and_field_choices.iter().for_each(|entry| {
      let (choice, keys_for_choice) = entry;
      match choice.core_shape_kind {
        ShapeKind::ObjectKind => {
          keys_for_choice.iter().for_each(|key_and_field_id| {
            let (key, field_id, field_shape_id) = key_and_field_id;
            if let None = object_keys.iter().find(|object_key| *object_key == key) {
              // emit diff

              let shape_trail =
                choice
                  .shape_trail()
                  .with_component(ShapeTrailPathComponent::ObjectFieldTrail {
                    field_id: field_id.clone(),
                    field_shape_id: field_shape_id.clone(),
                  });
              let json_trail = object_json_trail
                .with_component(JsonTrailPathComponent::JsonObjectKey { key: key.clone() });
              let diff = ShapeDiffResult::UnmatchedShape {
                json_trail,
                shape_trail,
              };
              self.push(diff);
            }
          })
        }
        _ => unreachable!("expected choice to be ObjectKind"),
      }
    })
  }
}
