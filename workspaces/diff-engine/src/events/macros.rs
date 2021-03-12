#[macro_export]
macro_rules! cqrs_event {
  // Single Event => event_name. Impls for a single event
  ($event_type: ty => $name: expr) => {
    impl ::cqrs_core::Event for $event_type {
      fn event_type(&self) -> &'static str {
        $name
      }
    }

    impl $crate::events::WithEventContext for $event_type {
      fn with_event_context(&mut self, event_context: EventContext) {
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

    impl $crate::events::WithEventContext for $group_type {
      fn with_event_context(&mut self, event_context: EventContext) {
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
