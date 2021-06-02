use serde::de::{self, Deserializer, IgnoredAny, SeqAccess, Visitor};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

pub mod body;
pub mod endpoint;
pub mod shape;

pub trait SpecIdGenerator {
  fn generate_id(&mut self, prefix: &str) -> String;

  fn field(&mut self) -> String {
    self.generate_id("field_")
  }

  fn request(&mut self) -> String {
    self.generate_id("request_")
  }

  fn response(&mut self) -> String {
    self.generate_id("response_")
  }

  fn shape(&mut self) -> String {
    self.generate_id("shape_")
  }

  fn shape_param(&mut self) -> String {
    self.generate_id("shape_param_")
  }
}

#[derive(Debug, Serialize)]
pub struct TaggedInput<T>(pub T, pub Tags);
pub type Tags = HashSet<String>;

impl<T> TaggedInput<T> {
  pub fn into_parts(self) -> (T, Tags) {
    (self.0, self.1)
  }

  pub fn parts(&self) -> (&T, &Tags) {
    (&self.0, &self.1)
  }

  pub fn into_input(self) -> T {
    self.0
  }
}

// Custom implementation of Deserialize, to allow ignoring additional items in the tuple,
// making it significantly easier to pipe results back in as inputs.
impl<'de, T> Deserialize<'de> for TaggedInput<T>
where
  T: Deserialize<'de>,
{
  fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
  where
    D: Deserializer<'de>,
  {
    struct TaggedInputVisitor<T> {
      marker: std::marker::PhantomData<T>,
    }

    impl<'de, T> Visitor<'de> for TaggedInputVisitor<T>
    where
      T: Deserialize<'de>,
    {
      type Value = TaggedInput<T>;

      fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct TaggedInput")
      }

      fn visit_seq<V>(self, mut seq: V) -> Result<Self::Value, V::Error>
      where
        V: SeqAccess<'de>,
      {
        let s = seq
          .next_element()?
          .ok_or_else(|| de::Error::invalid_length(0, &self))?;
        let n = seq
          .next_element()?
          .ok_or_else(|| de::Error::invalid_length(1, &self))?;

        // we must visit the rest of the elements in the sequence to prevent panics
        while let Some(IgnoredAny) = seq.next_element()? {
          // but we can just ignore them
        }

        Ok(TaggedInput(s, n))
      }
    }

    deserializer.deserialize_seq(TaggedInputVisitor {
      marker: std::marker::PhantomData,
    })
  }
}

// pub struct TaggedInputIterator<T> {
//   inner: Option<TaggedInput<T>>,
// }

// impl<T> Iterator for TaggedInputIterator<T> {
//   type Item = (Tags, T);

//   #[inline]
//   fn next(&mut self) -> Option<Self::Item> {
//     self.inner.take();

//     tagged_input.map(|tagged_input| {
//       let TaggedInput(input, tags) = tagged_input;
//       (tags, input)
//     })
//   }
// }

// impl<T> IntoIterator for TaggedInput<T> {
//   type Item = (Tags, T);
//   type IntoIter = TaggedInputIterator<T>;

//   fn into_iter(self) -> Self::IntoIter {
//     TaggedInputIterator { inner: Some(self) }
//   }
// }
