use crate::shapehash;
use serde_json::map::Map as JsonMap;
use serde_json::Value as JsonValue;

#[derive(PartialEq, Clone, Debug)]
pub enum BodyDescriptor {
  Object(Vec<FieldDescriptor>),
  Array(ItemsDescriptor),
  String,
  Number,
  Boolean,
  Null,
}

#[derive(PartialEq, Clone, Debug)]
pub struct FieldDescriptor {
  pub key: String,
  pub body: Box<BodyDescriptor>,
}

impl FieldDescriptor {
  pub fn new(key: String, body: BodyDescriptor) -> Self {
    Self {
      key,
      body: Box::new(body),
    }
  }
}

#[derive(PartialEq, Clone, Debug)]
pub struct ItemsDescriptor {
  pub all_items: Box<Vec<BodyDescriptor>>,
}

impl<T> From<T> for ItemsDescriptor
where
  T: Iterator<Item = BodyDescriptor>,
{
  fn from(all_items: T) -> Self {
    Self {
      all_items: Box::new(all_items.collect::<Vec<_>>()),
    }
  }
}

impl ItemsDescriptor {
  // @TODO: implement way to get unique items rather than all items
  // pub fn unique(&self) -> Vec<(BodyDescriptor, Vec<usize>)> {}
}

impl From<shapehash::ShapeDescriptor> for BodyDescriptor {
  fn from(mut shape_hash_descriptor: shapehash::ShapeDescriptor) -> Self {
    match shape_hash_descriptor.field_type {
      shapehash::ShapeDescriptor_PrimitiveType::OBJECT => {
        let fields = shape_hash_descriptor
          .take_fields()
          .into_iter()
          .map(|field_descriptor| {
            FieldDescriptor::new(
              field_descriptor.key.clone(),
              BodyDescriptor::from(field_descriptor.hash.unwrap()),
            )
          });
        BodyDescriptor::Object(fields.collect())
      }
      shapehash::ShapeDescriptor_PrimitiveType::ARRAY => {
        let items = shape_hash_descriptor
          .take_items()
          .into_iter()
          .map(|item_descriptor| BodyDescriptor::from(item_descriptor));

        BodyDescriptor::Array(ItemsDescriptor::from(items))
      }
      shapehash::ShapeDescriptor_PrimitiveType::BOOLEAN => BodyDescriptor::Boolean,
      shapehash::ShapeDescriptor_PrimitiveType::NULL => BodyDescriptor::Null,
      shapehash::ShapeDescriptor_PrimitiveType::NUMBER => BodyDescriptor::Number,
      shapehash::ShapeDescriptor_PrimitiveType::STRING => BodyDescriptor::String,
    }
  }
}

impl From<JsonValue> for BodyDescriptor {
  fn from(json_value: JsonValue) -> Self {
    match json_value {
      JsonValue::Object(json_fields) => {
        let fields = json_fields
          .into_iter()
          .map(|(key, value)| FieldDescriptor::new(key, BodyDescriptor::from(value)));

        BodyDescriptor::Object(fields.collect())
      }
      JsonValue::Array(json_items) => {
        let items = json_items
          .into_iter()
          .map(|item_descriptor| BodyDescriptor::from(item_descriptor));

        BodyDescriptor::Array(ItemsDescriptor::from(items))
      }
      JsonValue::Bool(_) => BodyDescriptor::Boolean,
      JsonValue::Null => BodyDescriptor::Null,
      JsonValue::Number(_) => BodyDescriptor::Number,
      JsonValue::String(_) => BodyDescriptor::String,
    }
  }
}

impl From<String> for BodyDescriptor {
  fn from(string: String) -> Self {
    BodyDescriptor::String
  }
}

impl From<&String> for BodyDescriptor {
  fn from(str: &String) -> Self {
    BodyDescriptor::String
  }
}
