/// Compactly implement Events or groups of Events. Implements `Event` and `WithEventContext` traits and links between groups.
///
/// # Examples
///
/// The most basic use is a single event struct, where one provides the struct and it's &'static str event name
/// ```
/// # use optic_diff_engine::EventContext;
/// # use optic_diff_engine::cqrs_event;
/// #
/// struct ExampleEvent {
///   some_property: String,
///   // struct is required to have an optional event_context
///   event_context: Option<EventContext>,
/// }
///
/// cqrs_event!(ExampleEvent => "example_event_name");
/// ```
///
/// A enum of nested events can also be expressed, as long as the variants and struct names match. In addition to
/// `Event` and `WithEventContext` traits, it also implements `From<Variant> for Group` for each variant.
/// ```
/// # use optic_diff_engine::EventContext;
/// # use optic_diff_engine::cqrs_event;
/// #
/// struct ExampleEvent {
///   some_property: String,
///   // struct is required to have an optional event_context
///   event_context: Option<EventContext>,
/// }
///
/// struct AnotherExampleEvent {
///   other_property: u16,
///   // struct is required to have an optional event_context
///   event_context: Option<EventContext>,
/// }
///
/// enum EventGroup {
///   ExampleEvent(ExampleEvent),
///   AnotherExampleEvent(AnotherExampleEvent)
/// }
///
/// cqrs_event!(ExampleEvent => "example_event_name");
/// cqrs_event!(AnotherExampleEvent => "another_example_event");
/// cqrs_event!(EventGroup {
///   ExampleEvent,
///   AnotherExampleEvent
/// });
/// ```
///
/// The two forms can also be combined, generating trait implementations for both the single events, as well as the group.
/// ```
/// # use optic_diff_engine::EventContext;
/// # use optic_diff_engine::cqrs_event;
/// #
/// # struct ExampleEvent {
/// #  event_context: Option<EventContext>,
/// # }
/// #
/// # struct AnotherExampleEvent {
/// #  event_context: Option<EventContext>,
/// # }
/// #
/// # enum EventGroup {
/// #  ExampleEvent(ExampleEvent),
/// #  AnotherExampleEvent(AnotherExampleEvent)
/// # }
/// #
/// cqrs_event!(EventGroup {
///   ExampleEvent => "example_event_name",
///   AnotherExampleEvent => "another_example_event_name"
/// });
/// ```
#[macro_export]
macro_rules! cqrs_event {
  // Single Event => event_name. Impls for a single event
  ($event_type: ty => $name: expr) => {
    impl ::cqrs_core::Event for $event_type {
      fn event_type(&self) -> &'static str {
        $name
      }
    }

    impl $crate::WithEventContext for $event_type {
      fn with_event_context(&mut self, event_context: $crate::EventContext) {
        self.event_context.replace(event_context);
      }
    }
  };

  // Group (enum) { Event }. Impls for a group of events
  ($group_type: ident { $($event_type: ident),+ }) => {
    impl ::cqrs_core::Event for $group_type {
      fn event_type(&self) -> &'static str {
        match self {
          $( $group_type::$event_type(evt) => evt.event_type() ),+
        }
      }
    }

    impl $crate::WithEventContext for $group_type {
      fn with_event_context(&mut self, event_context: $crate::EventContext) {
        match self {
          $( $group_type::$event_type(evt) => evt.with_event_context(event_context)),+,
        }
      }
    }

    $(
      impl From<$event_type> for $group_type {
        fn from(event: $event_type) -> Self {
          Self::$event_type(event)
        }
      }
    )+
  };

  // Group (enum) { Event => event_name }, combining impls for group and it's single events
  ($group_type: ident { $($event_type: ident => $name: expr),+ }) => {
    $( cqrs_event!($event_type => $name); )+

    cqrs_event!($group_type { $($event_type),+});
  }

}
