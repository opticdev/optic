use crate::shapehash;
use serde_json::map::Map as JsonMap;
use serde_json::Value as JsonValue;
use std::collections::HashMap;

#[derive(PartialEq, Clone, Debug, Hash, Eq)]
pub enum BodyDescriptor {
  Object(ObjectDescriptor),
  Array(ItemsDescriptor),
  String,
  Number,
  Boolean,
  Null,
}

#[derive(PartialEq, Clone, Debug, Hash, Eq)]
pub struct FieldDescriptor(pub String, pub Box<BodyDescriptor>);

impl FieldDescriptor {
  pub fn new(key: String, body: BodyDescriptor) -> Self {
    Self(key, Box::new(body))
  }
}

#[derive(PartialEq, Clone, Debug, Hash, Eq)]
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

#[derive(PartialEq, Clone, Debug, Hash, Eq)]
pub struct ItemsDescriptor {
  unique_items: Box<Vec<(BodyDescriptor, Vec<usize>)>>,
}

impl<T> From<T> for ItemsDescriptor
where
  T: Iterator<Item = BodyDescriptor>,
{
  fn from(all_items: T) -> Self {
    let mut unique_items = all_items
      .enumerate()
      .fold(HashMap::new(), |mut indexes_by_unique_items, (i, item)| {
        {
          let items = indexes_by_unique_items.entry(item).or_insert(vec![]);
          items.push(i);
        };

        indexes_by_unique_items
      })
      .into_iter()
      .map(|(item, indexes)| (item.clone(), indexes))
      .collect::<Vec<_>>();

    unique_items.sort_by_key(|(_, indexes)| *indexes.first().unwrap());

    Self {
      unique_items: Box::new(unique_items),
    }
  }
}

impl ItemsDescriptor {
  // @TODO: decide if this is still interesting at all. Could be reconstructed from unique_items
  // pub fn into_all(self) -> impl Iterator<Item = BodyDescriptor> {
  //
  // }

  pub fn into_unique(self) -> impl Iterator<Item = (BodyDescriptor, Vec<usize>)> {
    self.unique_items.into_iter()
  }

  pub fn unique_items_count(&self) -> usize {
    self.unique_items.len()
  }
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
