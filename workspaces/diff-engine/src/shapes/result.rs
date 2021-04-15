use crate::shapes::{JsonTrail, ShapeTrail};
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

#[derive(Debug, Deserialize, Serialize)]
pub enum ShapeDiffResult {
  #[serde(rename_all = "camelCase")]
  UnspecifiedShape {
    json_trail: JsonTrail,
    shape_trail: ShapeTrail,
  },
  #[serde(rename_all = "camelCase")]
  UnmatchedShape {
    json_trail: JsonTrail,
    shape_trail: ShapeTrail,
  },
}

impl ShapeDiffResult {
  pub fn fingerprint(&self) -> String {
    let mut hash_state = DefaultHasher::new();
    Hash::hash(self, &mut hash_state);
    format!("{:x}", hash_state.finish())
  }
}

impl Hash for ShapeDiffResult {
  fn hash<H: Hasher>(&self, hash_state: &mut H) {
    match self {
      ShapeDiffResult::UnspecifiedShape {
        json_trail,
        shape_trail,
      } => {
        Hash::hash(&core::mem::discriminant(self), hash_state);
        Hash::hash(&json_trail.normalized(), hash_state);
        Hash::hash(shape_trail, hash_state);
      }
      ShapeDiffResult::UnmatchedShape {
        json_trail,
        shape_trail,
      } => {
        Hash::hash(&core::mem::discriminant(self), hash_state);
        Hash::hash(&json_trail.normalized(), hash_state);
        Hash::hash(shape_trail, hash_state);
      }
    }
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use insta::assert_debug_snapshot;

  #[test]
  fn can_produce_stable_fingerprint() {
    let shape_diffs = vec![
      ShapeDiffResult::UnspecifiedShape {
        json_trail: JsonTrail::empty().with_array_item(0),
        shape_trail: ShapeTrail {
          root_shape_id: String::from("some-shape-id"),
          path: vec![],
        },
      },
      ShapeDiffResult::UnspecifiedShape {
        json_trail: JsonTrail::empty().with_array_item(1),
        shape_trail: ShapeTrail {
          root_shape_id: String::from("some-shape-id"),
          path: vec![],
        },
      },
      ShapeDiffResult::UnspecifiedShape {
        json_trail: JsonTrail::empty().with_array_item(2),
        shape_trail: ShapeTrail {
          root_shape_id: String::from("some-shape-id"),
          path: vec![],
        },
      },
      ShapeDiffResult::UnspecifiedShape {
        json_trail: JsonTrail::empty().with_array_item(0),
        shape_trail: ShapeTrail {
          root_shape_id: String::from("other-shape-id"),
          path: vec![],
        },
      },
      ShapeDiffResult::UnmatchedShape {
        json_trail: JsonTrail::empty().with_array_item(0),
        shape_trail: ShapeTrail {
          root_shape_id: String::from("some-shape-id"),
          path: vec![],
        },
      },
      ShapeDiffResult::UnmatchedShape {
        json_trail: JsonTrail::empty().with_array_item(2),
        shape_trail: ShapeTrail {
          root_shape_id: String::from("some-shape-id"),
          path: vec![],
        },
      },
      ShapeDiffResult::UnmatchedShape {
        json_trail: JsonTrail::empty().with_array_item(0),
        shape_trail: ShapeTrail {
          root_shape_id: String::from("other-shape-id"),
          path: vec![],
        },
      },
    ];

    let fingerprints = shape_diffs
      .iter()
      .map(|shape_diff| shape_diff.fingerprint())
      .collect::<Vec<_>>();

    assert_eq!(
      fingerprints[0], fingerprints[1],
      "json trail of unspecified variant is normalized"
    );
    assert_eq!(
      fingerprints[0], fingerprints[2],
      "json trail of unspecified variant is normalized"
    );
    assert_ne!(
      fingerprints[0], fingerprints[3],
      "shape trail of unspecified variant is not normalized"
    );
    assert_ne!(
      fingerprints[0], fingerprints[4],
      "variants produce different hashes"
    );
    assert_eq!(
      fingerprints[4], fingerprints[5],
      "json trail of unmatched variant is normalized"
    );
    assert_ne!(
      fingerprints[4], fingerprints[6],
      "shape trail of unmatched variant is not normalized"
    );
    assert_debug_snapshot!("can_produce_stable_fingerprint__fingerprints", fingerprints);
  }
}
