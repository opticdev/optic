use cqrs_core::{Aggregate, AggregateEvent};
use petgraph::graph::{Graph, NodeIndex};
use std::collections::HashMap;

use crate::events::RfcEvent;

pub const ROOT_COMMIT_ID: &str = "root";

pub type NodeId = String;
pub type CommitId = String;

#[derive(Debug)]
pub enum Node {
  BatchCommit(BatchCommitNode),
}

#[derive(Debug)]
pub struct BatchCommitNode(CommitId, BatchCommitNodeDescriptor);

#[derive(Debug)]
pub struct BatchCommitNodeDescriptor {
  commit_message: String,
  is_complete: bool,
}

#[derive(Debug)]
pub enum Edge {
  IsChildOf,
}

#[derive(Debug)]
pub struct HistoryProjection {
  pub graph: Graph<Node, Edge>,
  pub node_id_to_index: HashMap<NodeId, NodeIndex>,
}

impl Default for HistoryProjection {
  fn default() -> Self {
    let graph = Graph::new();
    let node_id_to_index = HashMap::new();

    HistoryProjection {
      graph,
      node_id_to_index,
    }
  }
}

impl HistoryProjection {
  fn with_batch_commit_start(
    &mut self,
    batch_id: CommitId,
    parent_batch_id: Option<CommitId>,
    commit_message: String,
  ) {
    let node = Node::BatchCommit(BatchCommitNode(
      batch_id.clone(),
      BatchCommitNodeDescriptor {
        commit_message,
        is_complete: false,
      },
    ));
    let node_index = self.graph.add_node(node);
    self.node_id_to_index.insert(batch_id.clone(), node_index);

    if let Some(parent_batch_id) = parent_batch_id {
      let parent_node_index = *self
        .node_id_to_index
        .get(&parent_batch_id)
        .expect("expected parent commit to have a corresponding node");

      self
        .graph
        .add_edge(node_index, parent_node_index, Edge::IsChildOf);
    }
  }

  fn with_batch_commit_end(&mut self, batch_id: CommitId) {
    let commit_node_index = *self
      .get_batch_commit_node_index(&batch_id)
      .expect("expected batch commit to have a corresponding node");

    let commit_node_descriptor = match self.graph.node_weight_mut(commit_node_index).unwrap() {
      Node::BatchCommit(node_descriptor) => &mut node_descriptor.1,
    };

    commit_node_descriptor.is_complete = true;
  }

  #[allow(irrefutable_let_patterns)]
  fn get_batch_commit_node_index(&self, batch_id: &CommitId) -> Option<&NodeIndex> {
    let node_index = self.node_id_to_index.get(batch_id)?;
    let node = self.graph.node_weight(*node_index)?;
    if let &Node::BatchCommit(_) = node {
      Some(node_index)
    } else {
      None
    }
  }
}

impl Aggregate for HistoryProjection {
  fn aggregate_type() -> &'static str {
    "history_projection"
  }
}

// Events
// ------

impl AggregateEvent<HistoryProjection> for RfcEvent {
  fn apply_to(self, projection: &mut HistoryProjection) {
    match self {
      RfcEvent::BatchCommitStarted(e) => {
        projection.with_batch_commit_start(e.batch_id, e.parent_id, e.commit_message);
      }
      RfcEvent::BatchCommitEnded(e) => {
        projection.with_batch_commit_end(e.batch_id);
      }
      // explicitly ignore other rfc events, so we don't silently swallow newly added events
      RfcEvent::APINamed(_) | RfcEvent::ContributionAdded(_) | RfcEvent::GitStateSet(_) => {}
    }
  }
}

impl<I> From<I> for HistoryProjection
where
  I: IntoIterator,
  I::Item: AggregateEvent<Self>,
{
  fn from(events: I) -> Self {
    let mut projection = HistoryProjection::default();
    for event in events.into_iter() {
      projection.apply(event);
    }
    projection
  }
}
