use crate::projections::shape::{CoreShapeNode, Edge, Node};
use crate::projections::shape::{ShapeNode, ShapeProjection};
use crate::shapes::traverser::{ShapeTrail, ShapeTrailPathComponent};
use crate::state::shape::{ShapeId, ShapeKind, ShapeParameterId};
use petgraph::visit::EdgeRef;

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

    // TODO: ask ourselve why we're walking all the path components, if we're not actually walking
    // the nodes connecting them. The walking of the graph and making sure the shape trail is valid
    // happens while constructing the Shapetrail. So could we just take the last here?
    let mut last_node_index = root_node_index;
    while let Some(trail_component) = trail_components.next() {
      match trail_component {
        ShapeTrailPathComponent::ListItemTrail {
          list_shape_id,
          item_shape_id,
        } => {
          last_node_index = projection.get_shape_node_index(&item_shape_id);
        }
        _ => {
          unimplemented!(
            "resolving of trail choices for shape trail component not implemented yet: {:?}",
            trail_component
          );
        }
      }
      if let None = last_node_index {
        break;
      }
    }

    if let None = last_node_index {
      return vec![];
    }

    let current_node_index = last_node_index.unwrap();
    let core_shape_nodes = projection.get_core_shape_nodes(&current_node_index);
    if let None = core_shape_nodes {
      return vec![];
    }

    core_shape_nodes
      .unwrap()
      .map(|CoreShapeNode(core_shape_id, core_shape_descriptor)| {
        let shape_id = match self.shape_projection.graph.node_weight(*current_node_index) {
          Some(Node::Shape(ShapeNode(shape_id, _))) => shape_id,
          _ => unreachable!("expected to be a core shape node"),
        };
        ChoiceOutput {
          parent_trail: shape_trail.clone(),
          additional_components: vec![],
          shape_id: shape_id.clone(),
          core_shape_kind: core_shape_descriptor.kind.clone(),
        }
      })
      .collect::<Vec<_>>()
  }

  pub fn resolve_parameter_to_shape(
    &self,
    shape_id: &ShapeId,
    shape_parameter_id: &ShapeParameterId,
  ) -> ShapeId {
    let projection = &self.shape_projection;

    let shape_node_index = projection
      .get_shape_node_index(shape_id)
      .expect("shape id to resolve parameter for must exist");

    let shape_parameter_node_index = projection
      .get_shape_parameter_node_index(shape_parameter_id)
      .unwrap_or_else(|| {
        panic!(
          "shape parameter id '{}' to resolve parameter for must exist",
          shape_parameter_id
        )
      });

    // @REFACTOR: move this to a method on the projection, we shouldn't have
    // to reach into projection internals
    let mut outgoing_edges = projection
      .graph
      .edges_connecting(*shape_node_index, *shape_parameter_node_index);

    let existing_binding = outgoing_edges
      .next()
      .expect("expected a parameter binding to exist");
    let edge_index = existing_binding.id();
    let edge_weight = projection.graph.edge_weight(edge_index).unwrap();
    match edge_weight {
      Edge::HasBinding(b) => b.shape_id.clone(),
      _ => unreachable!("expected edge to be a HasBinding"),
    }
  }
}

#[derive(Clone, Debug)]
pub struct ChoiceOutput {
  pub parent_trail: ShapeTrail,
  pub additional_components: Vec<ShapeTrailPathComponent>,
  pub shape_id: ShapeId,
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
