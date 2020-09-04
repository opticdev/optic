use crate::projections::shape::ShapeProjection;
use crate::shapes::traverser::{ShapeTrail, ShapeTrailPathComponent};
use crate::state::shape::ShapeKind;

pub struct ShapeQueries<'a> {
  pub shape_projection: &'a ShapeProjection,
}

impl<'a> ShapeQueries<'a> {
  pub fn new(shape_projection: &'a ShapeProjection) -> Self {
    ShapeQueries { shape_projection }
  }

  pub fn list_trail_choices(
    &self,
    shape_trail: &ShapeTrail,
    /*, parameter bindings */
  ) -> Vec<ChoiceOutput> {
    let projection = &self.shape_projection;
    let root_node_index = projection.get_shape_node_index(&shape_trail.root_shape_id);

    let mut trail_components = shape_trail.path.iter();

    let mut parent_node_index = root_node_index;
    while let Some(trail_component) = trail_components.next() {
      // TODO: implement walking of graph by trail components
      // let component_node = match trail_component {
      //   ShapeTrailPathComponent::
      // }
      //   projection.get_descendant_shape_node_index(&parent_node_index, &shape_id);
    }

    let current_node_index = parent_node_index.expect("shape trail to describe existing shapes");
    let core_shapes = projection.get_core_shapes(&current_node_index);

    // core_shapes.into_iter().map(|core_shape| {
    //   let node = projection.graph.node_weight(core_shape_index);
    //   ChoiceOutput {
    //   }
    // })

    vec![]
  }
}

pub struct ChoiceOutput {
  pub parent_trail: ShapeTrail,
  pub additional_components: Vec<ShapeTrailPathComponent>,
  // shape_id: ShapeId,
  pub core_shape_kind: ShapeKind,
}

impl ChoiceOutput {
  pub fn shape_trail(&self) -> ShapeTrail {
    let mut path = self.parent_trail.path.clone();
    let mut additional_components = self.additional_components.clone();
    path.append(&mut additional_components);
    ShapeTrail {
      root_shape_id: self.parent_trail.root_shape_id.clone(),
      path,
    }
  }
}
