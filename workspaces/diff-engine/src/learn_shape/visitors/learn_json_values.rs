use super::{
  BodyArrayVisitor, BodyObjectKeyVisitor, BodyObjectVisitor, BodyPrimitiveVisitor, BodyVisitor,
  VisitorResults,
};
use crate::learn_shape::visitors::BodyVisitors;
use crate::queries::shape::ChoiceOutput;
use crate::shapes::{JsonTrail, JsonTrailPathComponent, ShapeTrail, ShapeTrailPathComponent};
use crate::state::body::BodyDescriptor;
use crate::state::shape::{FieldId, ShapeId, ShapeKind};
use serde_json::Value as JsonValue;
use std::borrow::Borrow;

pub struct LearnVisitors {
  array: LearnArrayVisitor,
  object: LearnObjectVisitor,
  object_key: LearnObjectKeyVisitor,
  primitive: LearnPrimitiveVisitor,
}

impl LearnVisitors {
  pub fn new() -> Self {
    LearnVisitors {
      array: LearnArrayVisitor::new(),
      object: LearnObjectVisitor::new(),
      object_key: LearnObjectKeyVisitor::new(),
      primitive: LearnPrimitiveVisitor::new(),
    }
  }
}

pub enum ShapeLearnResult {}

type LearnResults = VisitorResults<ShapeLearnResult>;

impl BodyVisitors<ShapeLearnResult> for LearnVisitors {
  type Array = LearnArrayVisitor;
  type Object = LearnObjectVisitor;
  type ObjectKey = LearnObjectKeyVisitor;
  type Primitive = LearnPrimitiveVisitor;

  fn array(&mut self) -> &mut LearnArrayVisitor {
    &mut self.array
  }

  fn object(&mut self) -> &mut LearnObjectVisitor {
    &mut self.object
  }

  fn object_key(&mut self) -> &mut LearnObjectKeyVisitor {
    &mut self.object_key
  }

  fn primitive(&mut self) -> &mut LearnPrimitiveVisitor {
    &mut self.primitive
  }
}

// Primitive visitor
// -----------------

pub struct LearnPrimitiveVisitor {
  results: LearnResults,
}

impl LearnPrimitiveVisitor {
  pub fn new() -> Self {
    Self {
      results: LearnResults::new(),
    }
  }
}

impl BodyVisitor<ShapeLearnResult> for LearnPrimitiveVisitor {
  fn results(&mut self) -> Option<&mut LearnResults> {
    Some(&mut self.results)
  }
}

impl BodyPrimitiveVisitor<ShapeLearnResult> for LearnPrimitiveVisitor {
  fn visit(&mut self, body: BodyDescriptor, json_trail: JsonTrail) {
    dbg!(&body);
    dbg!(&json_trail);

    // let (matched, unmatched): (Vec<&ChoiceOutput>, Vec<&ChoiceOutput>) =
    //   trail_choices.iter().partition(|choice| match &body {
    //     BodyDescriptor::Boolean => match choice.core_shape_kind {
    //       ShapeKind::BooleanKind => true,
    //       _ => false,
    //     },
    //     BodyDescriptor::Number => match choice.core_shape_kind {
    //       ShapeKind::NumberKind => true,
    //       _ => false,
    //     },
    //     BodyDescriptor::String => match choice.core_shape_kind {
    //       ShapeKind::StringKind => true,
    //       _ => false,
    //     },
    //     BodyDescriptor::Null => match choice.core_shape_kind {
    //       ShapeKind::NullableKind => true,
    //       _ => false,
    //     },
    //     _ => unreachable!("should not call primitive visitor without a primitive value"),
    //   });
  }
}

// Array visitor
// -------------

pub struct LearnArrayVisitor {
  results: LearnResults,
}

impl LearnArrayVisitor {
  pub fn new() -> Self {
    Self {
      results: LearnResults::new(),
    }
  }
}

impl BodyVisitor<ShapeLearnResult> for LearnArrayVisitor {
  fn results(&mut self) -> Option<&mut LearnResults> {
    Some(&mut self.results)
  }
}

impl BodyArrayVisitor<ShapeLearnResult> for LearnArrayVisitor {
  fn visit(&mut self, body: &BodyDescriptor, json_trail: &JsonTrail) {}
}

// Object visitor
// -------------

pub struct LearnObjectVisitor {
  results: LearnResults,
}

impl LearnObjectVisitor {
  pub fn new() -> Self {
    Self {
      results: LearnResults::new(),
    }
  }
}

impl BodyVisitor<ShapeLearnResult> for LearnObjectVisitor {
  fn results(&mut self) -> Option<&mut LearnResults> {
    Some(&mut self.results)
  }
}

impl BodyObjectVisitor<ShapeLearnResult> for LearnObjectVisitor {
  fn visit(&mut self, body: &BodyDescriptor, json_trail: &JsonTrail) {}
}

// Object Key visitor
// ------------------

pub struct LearnObjectKeyVisitor {
  results: LearnResults,
}

impl LearnObjectKeyVisitor {
  pub fn new() -> Self {
    Self {
      results: LearnResults::new(),
    }
  }
}

impl BodyVisitor<ShapeLearnResult> for LearnObjectKeyVisitor {
  fn results(&mut self) -> Option<&mut LearnResults> {
    Some(&mut self.results)
  }
}

impl BodyObjectKeyVisitor<ShapeLearnResult> for LearnObjectKeyVisitor {
  fn visit(&mut self, object_json_trail: &JsonTrail, object_keys: &Vec<String>) {}
}
