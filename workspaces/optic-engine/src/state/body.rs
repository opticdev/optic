use crate::shapehash;
use serde::de::value;
use serde_json::map::Map as JsonMap;
use serde_json::Value as JsonValue;
use serde_urlencoded;
use std::collections::{BTreeMap, HashMap};

#[derive(PartialEq, Clone, Debug, Hash, Eq)]
pub enum BodyDescriptor {
  Object(ObjectDescriptor),
  Array(ItemsDescriptor),
  String,
  Number,
  Boolean,
  Null,
}

impl BodyDescriptor {
  pub fn empty_object() -> Self {
    Self::Object(ObjectDescriptor::from(std::iter::empty()))
  }
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

impl From<BodyDescriptor> for ItemsDescriptor {
  fn from(single_item: BodyDescriptor) -> Self {
    Self {
      unique_items: Box::new(vec![(single_item, vec![0])]),
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

#[derive(Debug, Default)]
pub struct ParsedQueryString {
  entries: Vec<(String, String)>,
}

impl ParsedQueryString {
  pub fn from_str(query_string: &str) -> Result<Self, serde_urlencoded::de::Error> {
    let entries = serde_urlencoded::from_str(query_string)?;
    Ok(Self { entries })
  }
}

impl From<ParsedQueryString> for BodyDescriptor {
  fn from(parsed_qs: ParsedQueryString) -> Self {
    let mut values_by_key = BTreeMap::new();

    for (key, value) in parsed_qs.entries {
      let entry = values_by_key.entry(key).or_insert_with(|| vec![]);
      entry.push(value);
    }

    let fields = values_by_key.into_iter().map(|(key, values)| {
      let value_descriptor = if values.len() == 1 {
        BodyDescriptor::String
      } else {
        let item_descriptor = ItemsDescriptor::from(BodyDescriptor::String); // we only ever expect strings with this parser
        BodyDescriptor::Array(item_descriptor)
      };

      (key, value_descriptor)
    });

    BodyDescriptor::Object(ObjectDescriptor::from(fields))
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use insta::assert_debug_snapshot;

  #[test]
  fn query_string_can_be_parsed_to_body_descriptor() {
    let parsed = ParsedQueryString::from_str("foo=bar&csv=1,2,51&list=twelve&list=fourteen")
      .expect("should be able to parse a query string");

    assert_debug_snapshot!(
      "query_string_can_be_parsed_to_body_descriptor__parsed",
      &parsed
    );

    let body_descriptor = BodyDescriptor::from(parsed);

    assert_debug_snapshot!(
      "query_string_can_be_parsed_to_body_descriptor__body_descriptor",
      body_descriptor
    );
  }
}
