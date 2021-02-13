use crate::events::{SpecEvent, ShapeEvent, EndpointEvent, EventContext};
use crate::events::shape::{ShapeId, ShapeParameterId};
use crate::projections::endpoint::ROOT_PATH_ID;
use crate::state::endpoint::PathComponentId;
use cqrs_core::{Aggregate, AggregateEvent};
use chrono::{DateTime, Utc, TimeZone};
use std::convert::From;
use std::collections::HashMap;

type Method = String;
type Path = String;
type EndpointId = (Method, Path);

#[derive(Debug, Clone)]
pub struct Endpoint {
  pub path: Path,
  pub method: Method,
  pub added: DateTime<Utc>
}

#[derive(Debug)]
pub struct ChangelogProjection {
  pub endpoints: HashMap<EndpointId, Endpoint>,
  pub paths: HashMap<PathComponentId, Path>,
  pub latest: String
}

impl Default for ChangelogProjection {
  fn default() -> Self {
    let mut paths: HashMap<PathComponentId, Path> = HashMap::new();
    paths.insert(String::from("root"), String::from("/"));
    let latest = String::from("1970-01-01 00:00:00 UTC");
    ChangelogProjection{
      endpoints: HashMap::new(),
      paths: paths,
      latest: latest
    }
  }
}

impl Aggregate for ChangelogProjection {
  fn aggregate_type() -> &'static str {
    "changelog_projection"
  }
}

impl AggregateEvent<ChangelogProjection> for SpecEvent {
  fn apply_to(self, aggregate: &mut ChangelogProjection) {
    match self { 
      SpecEvent::EndpointEvent(e) => { e.apply_to(aggregate) },
      _ => {}
    };
  }
}

// Duplication could be reduced by creating a type of events with context
impl AggregateEvent<ChangelogProjection> for EndpointEvent {
  fn apply_to(self, aggregate: &mut ChangelogProjection) {
    match self { 
      EndpointEvent::PathComponentAdded(e) => { 
        aggregate.path_added(e.parent_path_id, e.path_id, e.name, false);
      },
      EndpointEvent::PathParameterAdded(e) => { 
        aggregate.path_added(e.parent_path_id, e.path_id, e.name, true);
      },
      EndpointEvent::RequestAdded(e) => {
        let at = aggregate.event_at(e.event_context);
        aggregate.method_added(e.path_id, e.http_method, at);
      },
      EndpointEvent::ResponseAddedByPathAndMethod(e) => {
        let at = aggregate.event_at(e.event_context);
        aggregate.method_added(e.path_id, e.http_method, at);
      },
      EndpointEvent::RequestParameterAddedByPathAndMethod(e) => { 
        let at = aggregate.event_at(e.event_context);
        aggregate.method_added(e.path_id, e.http_method, at);
      },
      EndpointEvent::PathComponentRenamed(_) |
      EndpointEvent::PathComponentRemoved(_) |
      EndpointEvent::PathParameterRenamed(_) |
      EndpointEvent::PathParameterRemoved(_) |
      EndpointEvent::RequestParameterRemoved(_) |
      EndpointEvent::ResponseRemoved(_) => { 
        panic!("rename/remove not handled") // Need a graph implementation
      },
      _ => {}
    };
  }
}

impl ChangelogProjection {
  fn path_added(&mut self, parent: PathComponentId, id: PathComponentId, name: String, param: bool) {
    if parent == ROOT_PATH_ID {
      self.paths.insert(id, format!("/{}", name));
    } else {
      let error = format!("parent {} must be seen before child {}", &parent, &id);
      let parent_name = self.paths.get(&parent).expect(&error);
      if param {
        self.paths.insert(id, format!("{}/:{}", parent_name, name));
      } else {
        self.paths.insert(id, format!("{}/{}", parent_name, name));
      }
    }
  }
  
  fn event_at(&mut self, context: Option<EventContext>) -> DateTime<Utc> {
    if let Some(c) = context {
      self.latest = c.created_at;
    }
    let error = format!("{} is not utc time", &self.latest);
    self.latest.parse::<DateTime<Utc>>().expect(&error)
  }

  fn method_added(&mut self, id: PathComponentId, method: String, at: DateTime<Utc>) {
    let error = format!("path {} must be seen before method {} added at {}", &id, &method, &at.to_string());
    let path = String::from(self.paths.get(&id).expect(&error));
    let endpoint_id = (path.clone(), method.clone());
    if !self.endpoints.contains_key(&endpoint_id) {
      let endpoint = Endpoint{path: path.clone(), method: method.clone(), added: at};
      self.endpoints.insert(endpoint_id, endpoint);
    }
  }
}

impl From<Vec<SpecEvent>> for ChangelogProjection {
  fn from(events: Vec<SpecEvent>) -> Self {
    let mut changelog: ChangelogProjection = Default::default();
    for event in events {
      changelog.apply(event);
    }
    changelog
  }
}