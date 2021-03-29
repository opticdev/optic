use crate::commands::shape as shape_commands;
use crate::commands::{ShapeCommand, SpecCommand};
use crate::shapes::JsonTrail;
use crate::state::shape::{FieldId, ShapeId, ShapeKind, ShapeKindDescriptor};
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

  pub fn trails(&self) -> impl Iterator<Item = &JsonTrail> {
    self.values_by_trail.keys()
  }

  pub fn values(&self) -> impl Iterator<Item = &TrailValues> {
    self.values_by_trail.values()
  }

  pub fn into_commands<F>(
    mut self,
    mut generate_id: &mut F,
  ) -> (Option<String>, impl Iterator<Item = SpecCommand>)
  where
    F: FnMut() -> String,
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

    let mut shape_prototypes_by_trail = HashMap::new();
    let mut shape_prototypes = Vec::with_capacity(sorted_trails.len());

    for json_trail in sorted_trails.into_iter().rev() {
      let trail_values = self.values_by_trail.remove(&json_trail).unwrap();

      let shape_prototype =
        trail_values.into_shape_prototype(&mut generate_id, &shape_prototypes_by_trail);

      shape_prototypes_by_trail.insert(json_trail, shape_prototype.clone());
      shape_prototypes.push(shape_prototype);
    }

    let root_shape_id = shape_prototypes_by_trail
      .get(&JsonTrail::empty())
      .map(|root_shape_prototype| root_shape_prototype.id.clone());

    let commands =
      shape_prototypes_to_commands(shape_prototypes).map(|command| SpecCommand::from(command));

    (root_shape_id, commands)
  }
}

fn shape_prototypes_to_commands(
  shape_prototypes: impl IntoIterator<Item = ShapePrototype>,
) -> impl Iterator<Item = ShapeCommand> {
  shape_prototypes
    .into_iter()
    .map(|shape_prototype| {
      let [init_commands, describe_commands]: [Option<Vec<ShapeCommand>>; 2] =
        match shape_prototype.prototype_descriptor {
          ShapePrototypeDescriptor::PrimitiveKind { base_shape_kind } => {
            let add_command =
              ShapeCommand::add_shape(shape_prototype.id, base_shape_kind, String::from(""));
            [Some(vec![add_command]), None]
          }
          ShapePrototypeDescriptor::OneOfShape {
            branches,
            parameter_ids,
          } => {
            let mut commands = vec![ShapeCommand::add_shape(
              shape_prototype.id.clone(),
              ShapeKind::OneOfKind,
              String::from(""),
            )];

            let one_off_shape_id = shape_prototype.id.clone();

            let branch_ids = branches
              .iter()
              .zip(parameter_ids)
              .map(|(shape_prototype, parameter_id)| {
                (shape_prototype.id.clone(), parameter_id.clone())
              })
              .collect::<Vec<_>>();

            let branches_commands = shape_prototypes_to_commands(branches)
              .zip(branch_ids)
              .flat_map(|(branch_command, (branch_shape_id, parameter_id))| {
                vec![
                  branch_command,
                  ShapeCommand::add_shape_parameter(
                    parameter_id.clone(),
                    one_off_shape_id.clone(),
                    String::from(""),
                  ),
                  ShapeCommand::set_parameter_shape(
                    one_off_shape_id.clone(),
                    parameter_id.clone(),
                    branch_shape_id.clone(),
                  ),
                ]
              });

            commands.extend(branches_commands);

            [Some(commands), None]
          }
          ShapePrototypeDescriptor::ListOfShape { item_shape_id } => {
            let mut commands = vec![];
            commands.push(ShapeCommand::add_shape(
              shape_prototype.id.clone(),
              ShapeKind::ListKind,
              String::from(""),
            ));

            if let Some(item_shape_id) = item_shape_id {
              commands.push(ShapeCommand::set_parameter_shape(
                shape_prototype.id,
                String::from(
                  ShapeKind::ListKind
                    .get_parameter_descriptor()
                    .unwrap()
                    .shape_parameter_id,
                ),
                item_shape_id,
              ));
            }

            [Some(commands), None]
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
}

impl From<HashMap<JsonTrail, TrailValues>> for TrailObservationsResult {
  fn from(values_by_trail: HashMap<JsonTrail, TrailValues>) -> Self {
    Self { values_by_trail }
  }
}

pub type FieldSet = HashSet<String>;

#[derive(Clone, Debug)]
pub struct TrailValues {
  pub trail: JsonTrail,
  pub was_string: bool,
  pub was_number: bool,
  pub was_boolean: bool,
  pub was_null: bool,
  pub was_array: bool,
  pub was_object: bool,
  pub was_empty_array: bool,
  pub field_sets: Vec<FieldSet>,
}

impl From<JsonTrail> for TrailValues {
  fn from(json_trail: JsonTrail) -> Self {
    TrailValues::new(&json_trail)
  }
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
      was_empty_array: false,
      field_sets: Default::default(),
    }
  }

  pub fn union(&mut self, new_values: TrailValues) {
    self.was_string = self.was_string || new_values.was_string;
    self.was_number = self.was_number || new_values.was_number;
    self.was_boolean = self.was_boolean || new_values.was_boolean;
    self.was_null = self.was_null || new_values.was_null;
    self.was_array = self.was_array || new_values.was_array;
    self.was_empty_array = self.was_empty_array || new_values.was_empty_array;
    self.was_object = self.was_object || new_values.was_object;

    for new_field_set in new_values.field_sets {
      self.insert_field_set(new_field_set);
    }
  }

  pub fn insert_field_set(&mut self, field_set: FieldSet) {
    let exists = self.field_sets.iter().any(|existing_set| {
      if let None = existing_set.difference(&field_set).next() {
        true
      } else {
        false
      }
    });

    if !exists {
      self.field_sets.push(field_set);
    }
  }

  fn into_shape_prototype<F>(
    self,
    generate_id: &mut F,
    existing_prototypes: &HashMap<JsonTrail, ShapePrototype>,
  ) -> ShapePrototype
  where
    F: FnMut() -> String,
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
      if self.was_array {
        let item_trail = self.trail.with_array_item(0);
        let item_shape_id = if self.was_empty_array {
          None
        } else {
          let item_prototype = existing_prototypes
            .get(&item_trail)
            .expect("item shape prototype should have been generated before its parent list");
          Some(item_prototype.id.clone())
        };

        Some(ShapePrototypeDescriptor::ListOfShape { item_shape_id })
      } else {
        None
      },
      if self.was_object {
        let field_keys = {
          let mut keys = self
            .field_sets
            .iter()
            .fold(HashSet::new(), |aggregate: HashSet<String>, field_set| {
              aggregate.union(&field_set).cloned().collect()
            })
            .into_iter()
            .collect::<Vec<_>>();
          keys.sort();
          keys
        };

        let field_descriptors = field_keys
          .into_iter()
          .map(|key| {
            let field_trail = self.trail.with_object_key(key.clone());
            let field_shape_prototype = existing_prototypes.get(&field_trail).expect(
              "object field shape prototype should have been generated before its parent object",
            );

            FieldPrototypeDescriptor {
              field_id: generate_id(),
              key,
              value_shape_id: field_shape_prototype.id.clone(),
            }
          })
          .collect::<Vec<_>>();

        Some(ShapePrototypeDescriptor::ObjectWithFields {
          fields: field_descriptors,
        })
      } else {
        None
      },
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
          parameter_ids: (0..descriptors.len()).map(|_| generate_id()).collect(),
          branches: descriptors
            .into_iter()
            .map(|descriptor| ShapePrototype {
              id: generate_id(),
              trail: self.trail.clone(),
              prototype_descriptor: descriptor,
            })
            .collect(),
        },
      },
    }
  }
}

#[derive(Clone, Debug)]
struct ShapePrototype {
  id: ShapeId,
  trail: JsonTrail,
  prototype_descriptor: ShapePrototypeDescriptor,
}

#[derive(Clone, Debug)]
enum ShapePrototypeDescriptor {
  OptionalShape {
    shape: Box<ShapePrototype>,
  },
  NullableShape {
    shape: Box<ShapePrototype>,
  },
  OneOfShape {
    branches: Vec<ShapePrototype>,
    parameter_ids: Vec<String>,
  },
  ObjectWithFields {
    fields: Vec<FieldPrototypeDescriptor>,
  },
  ListOfShape {
    item_shape_id: Option<ShapeId>,
  },
  PrimitiveKind {
    base_shape_kind: ShapeKind,
  },
  Unknown,
}

#[derive(Clone, Debug)]
struct FieldPrototypeDescriptor {
  field_id: FieldId,
  key: String,
  value_shape_id: ShapeId,
}

#[cfg(test)]
mod test {
  use super::*;
  use crate::learn_shape::observe_body_trails;
  use crate::projections::SpecProjection;
  use crate::state::body::BodyDescriptor;
  use cqrs_core::Aggregate;
  use insta::assert_debug_snapshot;
  use serde_json::json;

  #[test]
  fn trail_observations_can_generate_commands_for_primitive_bodies() {
    let string_body = BodyDescriptor::from(json!("a string body"));
    let number_body = BodyDescriptor::from(json!(48));
    let boolean_body = BodyDescriptor::from(json!(true));

    let string_observations = observe_body_trails(string_body);
    let number_observations = observe_body_trails(number_body);
    let boolean_observations = observe_body_trails(boolean_body);

    let mut counter = 0;
    let mut test_id = || {
      let id = format!("test-id-{}", counter);
      counter += 1;
      id
    };
    let spec_projection = SpecProjection::default();

    let string_results = collect_commands(string_observations.into_commands(&mut test_id));
    assert!(string_results.0.is_some());
    assert_eq!(string_results.1.len(), 1);
    spec_projection
      .execute((&string_results.1[0]).clone())
      .expect("generated command should be valid");
    assert_debug_snapshot!(
      "trail_observations_can_generate_commands_for_primitive_bodies__string_results",
      &string_results
    );

    let number_results = collect_commands(number_observations.into_commands(&mut test_id));
    assert!(number_results.0.is_some());
    assert_eq!(number_results.1.len(), 1);
    spec_projection
      .execute((&number_results.1[0]).clone())
      .expect("generated command should be valid");
    assert_debug_snapshot!(
      "trail_observations_can_generate_commands_for_primitive_bodies__number_results",
      number_results
    );

    let boolean_results = collect_commands(boolean_observations.into_commands(&mut test_id));
    assert!(boolean_results.0.is_some());
    assert_eq!(boolean_results.1.len(), 1);
    spec_projection
      .execute((&boolean_results.1[0]).clone())
      .expect("generated command should be valid");
    assert_debug_snapshot!(
      "trail_observations_can_generate_commands_for_primitive_bodies__boolean_results",
      boolean_results
    );
  }

  #[test]
  fn trail_observations_can_generate_commands_for_one_off_of_primitives() {
    let string_body = BodyDescriptor::from(json!("a string body"));
    let number_body = BodyDescriptor::from(json!(48));
    let boolean_body = BodyDescriptor::from(json!(true));

    let mut observations = TrailObservationsResult::default();
    observations.union(observe_body_trails(string_body));
    observations.union(observe_body_trails(number_body));
    observations.union(observe_body_trails(boolean_body));

    let mut counter = 0;
    let mut test_id = || {
      let id = format!("test-id-{}", counter);
      counter += 1;
      id
    };
    let mut spec_projection = SpecProjection::default();

    let observation_results = collect_commands(observations.into_commands(&mut test_id));
    assert!(observation_results.0.is_some());
    assert_debug_snapshot!(
      "trail_observations_can_generate_commands_for_one_off_of_primitives__observation_results",
      observation_results
    );

    for command in observation_results.1 {
      let events = spec_projection
        .execute(command)
        .expect("generated commands must be valid");

      for event in events {
        spec_projection.apply(event)
      }
    }
  }

  #[test]
  fn trail_observations_can_generate_commands_for_array_bodies() {
    let primitive_array_body = BodyDescriptor::from(json!(["a", "b", "c"]));
    let empty_array_body = BodyDescriptor::from(json!([]));
    let polymorphic_array_body = BodyDescriptor::from(json!(["a", "b", 1, 2]));

    let primitive_array_observations = observe_body_trails(primitive_array_body);
    let empty_array_observations = observe_body_trails(empty_array_body);
    let polymorphic_array_observations = observe_body_trails(polymorphic_array_body);

    let mut counter = 0;
    let mut test_id = || {
      let id = format!("test-id-{}", counter);
      counter += 1;
      id
    };

    let primitive_array_results =
      collect_commands(primitive_array_observations.into_commands(&mut test_id));
    assert!(primitive_array_results.0.is_some());
    assert_valid_commands(primitive_array_results.1.clone());
    assert_debug_snapshot!(
      "trail_observations_can_generate_commands_for_array_bodies__primitive_array_results",
      &primitive_array_results
    );

    let empty_array_results =
      collect_commands(empty_array_observations.into_commands(&mut test_id));
    assert!(empty_array_results.0.is_some());
    assert_valid_commands(empty_array_results.1.clone());
    assert_debug_snapshot!(
      "trail_observations_can_generate_commands_for_array_bodies__empty_array_results",
      &empty_array_results
    );

    let polymorphic_array_results =
      collect_commands(polymorphic_array_observations.into_commands(&mut test_id));
    assert!(polymorphic_array_results.0.is_some());
    assert_valid_commands(polymorphic_array_results.1.clone());
    assert_debug_snapshot!(
      "trail_observations_can_generate_commands_for_array_bodies__polymorphic_array_results",
      &polymorphic_array_results
    );
  }

  #[test]
  fn trail_observations_can_generate_commands_for_object_bodies() {
    let primitive_object_body = BodyDescriptor::from(json!({
      "a-str": "a-value",
      "b-field": true,
      "c-field": 3
    }));
    let empty_object_body = BodyDescriptor::from(json!({}));

    let primitive_object_observations = observe_body_trails(primitive_object_body);
    let empty_object_observations = observe_body_trails(empty_object_body);

    let mut counter = 0;
    let mut test_id = || {
      let id = format!("test-id-{}", counter);
      counter += 1;
      id
    };

    let primitive_object_results =
      collect_commands(primitive_object_observations.into_commands(&mut test_id));
    assert!(primitive_object_results.0.is_some());
    assert_valid_commands(primitive_object_results.1.clone());
    assert_debug_snapshot!(
      "trail_observations_can_generate_commands_for_object_bodies__primitive_object_results",
      &primitive_object_results
    );

    let empty_object_results =
      collect_commands(empty_object_observations.into_commands(&mut test_id));
    assert!(empty_object_results.0.is_some());
    assert_valid_commands(empty_object_results.1.clone());
    assert_debug_snapshot!(
      "trail_observations_can_generate_commands_for_object_bodies__empty_object_results",
      &empty_object_results
    );
  }

  fn collect_commands(
    (root_shape_id, commands): (Option<String>, impl Iterator<Item = SpecCommand>),
  ) -> (Option<String>, Vec<SpecCommand>) {
    (root_shape_id, commands.collect::<Vec<_>>())
  }

  fn assert_valid_commands(commands: impl IntoIterator<Item = SpecCommand>) {
    let mut spec_projection = SpecProjection::default();
    for command in commands {
      let events = spec_projection
        .execute(command)
        .expect("generated commands must be valid");

      for event in events {
        spec_projection.apply(event)
      }
    }
  }
}
