use crate::shapehash;
use serde_json::map::Map as JsonMap;
use serde_json::Value as JsonValue;

#[derive(PartialEq, Clone, Debug)]
pub enum BodyDescriptor {
  Object(ObjectDescriptor),
  Array(ItemsDescriptor),
  String,
  Number,
  Boolean,
  Null,
}

#[derive(PartialEq, Clone, Debug)]
pub struct FieldDescriptor(pub String, pub Box<BodyDescriptor>);

impl FieldDescriptor {
  pub fn new(key: String, body: BodyDescriptor) -> Self {
    Self(key, Box::new(body))
  }
}

#[derive(PartialEq, Clone, Debug)]
pub struct ObjectDescriptor {
  fields: Vec<FieldDescriptor>,
}

impl ObjectDescriptor {
  pub fn keys(&self) -> impl Iterator<Item = &String> {
    self.fields.iter().map(|FieldDescriptor(key, body)| key)
  }

  pub fn entries(self) -> impl Iterator<Item = (String, BodyDescriptor)> {
    self
      .fields
      .into_iter()
      .map(|FieldDescriptor(key, body)| (key, *body))
  }
}

impl<T> From<T> for ObjectDescriptor
where
  T: Iterator<Item = (String, BodyDescriptor)>,
{
  fn from(entries: T) -> Self {
    Self {
      fields: entries
        .map(|(key, value)| FieldDescriptor::new(key, value))
        .collect(),
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
  pub fn into_all(self) -> impl Iterator<Item = BodyDescriptor> {
    self.all_items.into_iter()
  }

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
            (
              field_descriptor.key.clone(),
              BodyDescriptor::from(field_descriptor.hash.unwrap()),
            )
          });
        BodyDescriptor::Object(ObjectDescriptor::from(fields))
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
          .map(|(key, value)| (key, BodyDescriptor::from(value)));

        BodyDescriptor::Object(ObjectDescriptor::from(fields))
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
