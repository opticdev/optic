use crate::commands::shape as shape_commands;
use crate::commands::{ShapeCommand, SpecCommand};
use crate::shapes::JsonTrail;
use crate::state::shape::{ShapeKind, ShapeKindDescriptor};
use crate::BodyDescriptor;
use std::collections::{HashMap, HashSet};

#[derive(Clone, Debug, Default)]
pub struct TrailObservationsResult {
  values_by_trail: HashMap<JsonTrail, TrailValues>,
}

impl TrailObservationsResult {
  pub fn union(&mut self, new_result: TrailObservationsResult) {
    for (json_trail, new_trail_values) in new_result.values_by_trail {
      let existing_trail_values = self
        .values_by_trail
        .entry(json_trail)
        .or_insert_with_key(|json_trail| TrailValues::new(json_trail));

      existing_trail_values.union(new_trail_values);
    }
  }

  pub fn into_commands<F>(
    mut self,
    generate_id: &F,
  ) -> (Option<String>, impl Iterator<Item = SpecCommand>)
  where
    F: Fn() -> String,
  {
    let sorted_trails = {
      let mut trails = self
        .values_by_trail
        .keys()
        .map(|trail| trail.clone())
        .collect::<Vec<_>>();
      trails.sort(); // parents before children
      trails
    };

    let shape_prototypes = sorted_trails
      .into_iter()
      .rev() // leafs first
      .map(|json_trail| {
        let trail_values = self.values_by_trail.remove(&json_trail).unwrap();

        trail_values.into_shape_prototype(&generate_id)
      })
      .collect::<Vec<_>>();

    let root_shape_id = shape_prototypes
      .last() // since we created these leafs first, the last must be the root
      .map(|last_shape| last_shape.id.clone());

    let commands_iter = shape_prototypes
      .into_iter()
      .map(|shape_prototype| {
        let [init_commands, describe_commands]: [Option<Vec<ShapeCommand>>; 2] =
          match shape_prototype.prototype_descriptor {
            ShapePrototypeDescriptor::PrimitiveKind { base_shape_kind } => {
              let shape_kind_descriptor = base_shape_kind.get_descriptor();
              let add_command = ShapeCommand::add_shape(
                shape_prototype.id,
                String::from(shape_kind_descriptor.name),
                String::from(""),
              );
              [Some(vec![add_command]), None]
            }
            _ => [None, None],
          };

        [init_commands, describe_commands]
      })
      .fold(
        vec![vec![], vec![]],
        |mut existing_commands, new_commands| {
          let [new_init, new_describe] = new_commands;
          {
            let init_commands = &mut existing_commands[0];
            if let Some(commands) = new_init {
              init_commands.extend(commands);
            }
          }
          {
            let describe_commands = &mut existing_commands[1];

            if let Some(commands) = new_describe {
              describe_commands.extend(commands);
            }
          }
          existing_commands
        },
      )
      .into_iter()
      .flatten()
      .map(|command| SpecCommand::from(command));

    (root_shape_id, commands_iter)
  }
}

impl From<HashMap<JsonTrail, TrailValues>> for TrailObservationsResult {
  fn from(values_by_trail: HashMap<JsonTrail, TrailValues>) -> Self {
    Self { values_by_trail }
  }
}

pub type FieldSet = HashSet<String>;

#[derive(Clone, Debug)]
pub struct TrailValues {
  trail: JsonTrail,
  pub was_string: bool,
  pub was_number: bool,
  pub was_boolean: bool,
  pub was_null: bool,
  pub was_array: bool,
  pub was_object: bool,
  field_set: HashSet<FieldSet>,
}

impl TrailValues {
  pub fn new(json_trail: &JsonTrail) -> Self {
    Self {
      trail: json_trail.clone(),
      was_string: false,
      was_number: false,
      was_boolean: false,
      was_null: false,
      was_array: false,
      was_object: false,
      field_set: Default::default(),
    }
  }

  pub fn union(&mut self, new_values: TrailValues) {
    self.was_string = self.was_string || new_values.was_string;
    self.was_number = self.was_number || new_values.was_number;
    self.was_boolean = self.was_boolean || new_values.was_boolean;
    self.was_null = self.was_null || new_values.was_null;
    self.was_array = self.was_array || new_values.was_array;
    self.was_object = self.was_object || new_values.was_object;
    // TODO: figure out what to do about field sets
  }

  fn into_shape_prototype<F>(self, generate_id: &F) -> ShapePrototype
  where
    F: Fn() -> String,
  {
    let mut descriptors: Vec<_> = vec![
      if self.was_string {
        Some(ShapePrototypeDescriptor::PrimitiveKind {
          base_shape_kind: ShapeKind::StringKind,
        })
      } else {
        None
      },
      if self.was_number {
        Some(ShapePrototypeDescriptor::PrimitiveKind {
          base_shape_kind: ShapeKind::NumberKind,
        })
      } else {
        None
      },
      if self.was_boolean {
        Some(ShapePrototypeDescriptor::PrimitiveKind {
          base_shape_kind: ShapeKind::BooleanKind,
        })
      } else {
        None
      },
      // if self.was_array {
      //   Some(ShapePrototypeDescriptor::ListOfShape {

      //   })
      // } else {
      //   None
      // }
    ]
    .into_iter()
    .flatten()
    .collect();

    let descriptors_count = descriptors.len();
    match descriptors_count {
      0 => ShapePrototype {
        id: generate_id(),
        trail: self.trail,
        prototype_descriptor: ShapePrototypeDescriptor::Unknown,
      },
      1 => ShapePrototype {
        id: generate_id(),
        trail: self.trail,
        prototype_descriptor: descriptors.pop().unwrap(),
      },
      _ => ShapePrototype {
        id: generate_id(),
        trail: self.trail.clone(),
        prototype_descriptor: ShapePrototypeDescriptor::OneOfShape {
          branches: descriptors,
        },
      },
    }
  }
}

struct ShapePrototype {
  id: String,
  trail: JsonTrail,
  prototype_descriptor: ShapePrototypeDescriptor,
}

enum ShapePrototypeDescriptor {
  OptionalShape {
    shape: Box<ShapePrototype>,
  },
  NullableShape {
    shape: Box<ShapePrototype>,
  },
  OneOfShape {
    branches: Vec<ShapePrototypeDescriptor>,
  },
  ObjectWithFields {
    fields: Vec<ShapePrototype>,
  },
  ListOfShape {
    shape: Box<ShapePrototype>,
  },
  FieldWithShape {
    key: String,
    shape: Box<ShapePrototype>,
  },
  PrimitiveKind {
    base_shape_kind: ShapeKind,
  },
  Unknown,
}
