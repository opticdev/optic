use cqrs_core::{Aggregate, AggregateEvent};
use petgraph::visit;
use petgraph::{
  graph::{Graph, NodeIndex},
  Directed,
};
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
pub struct BatchCommitNode(CommitId, BatchCommitDescriptor);

#[derive(Debug)]
pub struct BatchCommitDescriptor {
  commit_message: String,
  pub is_complete: bool,
}

#[derive(Debug)]
pub enum Edge {
  IsParentOf,
}

#[derive(Debug)]
pub struct HistoryProjection {
  pub graph: Graph<Node, Edge>,
  pub node_id_to_index: HashMap<NodeId, NodeIndex>,
}

impl Default for HistoryProjection {
  fn default() -> Self {
    let mut graph = Graph::new();
    let mut node_id_to_index = HashMap::new();

    let root_commit_id = CommitId::from(ROOT_COMMIT_ID);
    let root_node = Node::BatchCommit(BatchCommitNode(
      root_commit_id.clone(),
      BatchCommitDescriptor {
        commit_message: String::from("Initial commit"),
        is_complete: false,
      },
    ));
    let root_node_index = graph.add_node(root_node);
    node_id_to_index.insert(root_commit_id, root_node_index);

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
    let parent_batch_id = parent_batch_id.unwrap_or_else(|| {
      self
        .get_commit_id(&self.find_last_batch_commit_index().unwrap())
        .unwrap()
        .clone()
    });

    if parent_batch_id == ROOT_COMMIT_ID {
      self.with_batch_commit_end(CommitId::from(ROOT_COMMIT_ID));
    }

    let node = Node::BatchCommit(BatchCommitNode(
      batch_id.clone(),
      BatchCommitDescriptor {
        commit_message,
        is_complete: false,
      },
    ));
    let node_index = self.graph.add_node(node);
    self.node_id_to_index.insert(batch_id.clone(), node_index);

    let parent_node_index = *self
      .node_id_to_index
      .get(&parent_batch_id)
      .expect(&*format!(
        "expected parent commit to have a corresponding node {:?}",
        parent_batch_id
      ));

    self
      .graph
      .add_edge(parent_node_index, node_index, Edge::IsParentOf);
  }

  fn with_batch_commit_end(&mut self, batch_id: CommitId) {
    let commit_node_index_option = self.get_batch_commit_node_index(&batch_id);
    if let Some(commit_node_index) = commit_node_index_option {
      let commit_node_index = *commit_node_index;
      let commit_node_descriptor = match self.graph.node_weight_mut(commit_node_index).unwrap() {
        Node::BatchCommit(node_descriptor) => &mut node_descriptor.1,
      };

      commit_node_descriptor.is_complete = true;
    }
  }

  #[allow(irrefutable_let_patterns)]
  pub fn get_batch_commit_node_index(&self, batch_id: &CommitId) -> Option<&NodeIndex> {
    let node_index = self.node_id_to_index.get(batch_id)?;
    let node = self.graph.node_weight(*node_index)?;
    if let &Node::BatchCommit(_) = node {
      Some(node_index)
    } else {
      None
    }
  }

  #[allow(irrefutable_let_patterns)]
  pub fn get_batch_commit_node(&self, batch_id: &CommitId) -> Option<&Node> {
    let node_index = self.node_id_to_index.get(batch_id)?;
    let node = self.graph.node_weight(*node_index)?;
    if let &Node::BatchCommit(_) = node {
      Some(node)
    } else {
      None
    }
  }

  #[allow(irrefutable_let_patterns)]
  pub fn get_commit_id(&self, node_index: &NodeIndex) -> Option<&CommitId> {
    let node = self.graph.node_weight(*node_index)?;
    if let &Node::BatchCommit(BatchCommitNode(commit_id, _)) = &node {
      Some(commit_id)
    } else {
      None
    }
  }

  #[allow(unreachable_patterns)]
  pub fn get_batch_commit_descriptor(&self, batch_id: &CommitId) -> Option<&BatchCommitDescriptor> {
    let node = self.get_batch_commit_node(batch_id)?;
    match node {
      Node::BatchCommit(BatchCommitNode(_, descriptor)) => Some(descriptor),
      _ => None,
    }
  }

  // pub fn get_batch_commits_iter(
  //   &self,
  //   batch_id: &CommitId,
  // ) -> Option<impl Iterator<Item = &CommitId>> {
  //   let commit_node_index = *self.get_batch_commit_node_index(batch_id)?;

  //   let commit_graph = NodeFiltered::from_fn(&self.graph, |node_index| {
  //     matches!(
  //       self.graph.node_weight(node_index),
  //       Some(Node::BatchCommit(_))
  //     )
  //   });

  //   let commit_log = EdgeFiltered::from_fn(&commit_graph, |edge| {
  //     matches!(edge.weight(), Edge::IsChildOf)
  //       && self
  //         .graph
  //         .edges_directed(edge.target(), petgraph::Direction::Incoming)
  //         .into_iter()
  //         .count()
  //         == 1
  //   });

  //   let dfs = Dfs::new(&commit_log, commit_node_index)
  //     .iter()
  //     .map(|node_index| &commit_log.node_weight(node_index));
  //   Some(std::iter::empty())
  //

  pub fn find_last_batch_commit_index(&self) -> Option<NodeIndex> {
    let root_node_index = *self.get_batch_commit_node_index(&CommitId::from(ROOT_COMMIT_ID))?;
    let commit_graph = visit::NodeFiltered::from_fn(&self.graph, |node_index| {
      matches!(
        self.graph.node_weight(node_index),
        Some(Node::BatchCommit(_))
      )
    });

    // @GOTCHA: this assumes there's the commit graph is a commit log, with no branches
    let mut leaf_node_index = Some(root_node_index);
    visit::depth_first_search(&self.graph, Some(root_node_index), |event| {
      if let visit::DfsEvent::TreeEdge(parent_node_index, child_node_index) = event {
        leaf_node_index.replace(child_node_index);
      }

      if let visit::DfsEvent::BackEdge(_, _) = event {
        visit::Control::Break(())
      } else {
        visit::Control::Continue
      }
    });

    leaf_node_index
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
