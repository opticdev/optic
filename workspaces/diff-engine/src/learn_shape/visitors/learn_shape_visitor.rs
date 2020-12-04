use crate::learn_shape::visitors::{JsonObjectVisitor, JsonVisitors, JsonArrayVisitor, JsonObjectKeyVisitor, JsonPrimitiveVisitor};
use crate::shapes::visitors::VisitorResults;
use std::collections::HashMap;
use crate::shapes::JsonTrail;
use crate::learn_shape::TrailValues;

type LearnResult = HashMap<JsonTrail, TrailValues>;
type LearnVisitorResult = VisitorResults<LearnResult>;

pub struct LearnJsonVisitors {
  array: JsonArrayVisitor<LearnVisitorResult>,
  object: JsonObjectVisitor<LearnVisitorResult>,
  object_key: JsonObjectKeyVisitor<LearnVisitorResult>,
  primitive: JsonPrimitiveVisitor<LearnVisitorResult>,
}

impl LearnJsonVisitors {
  pub fn new() -> Self {
    LearnJsonVisitors {
      array: JsonArrayVisitor::new(),
      object: JsonObjectVisitor::new(),
      object_key: JsonObjectKeyVisitor::new(),
      primitive: JsonPrimitiveVisitor::new(),
    }
  }
}

impl LearnJsonObjectVisitor for JsonVisitors<LearnVisitorResult> {


}
