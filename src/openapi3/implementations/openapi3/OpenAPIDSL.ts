import { IChange } from "../../sdk/types";
import {
  AddedHandler,
  AlwaysHandler,
  ChangedHandler,
  DSL,
} from "../../sdk/types";
import { EventEmitter } from "events";
import { OpenApiEndpointFact } from "./OpenAPITraverser";

const KEYS = {
  ENDPOINT_ADDED: "endpoint.added",
  ENDPOINT_ALWAYS: "endpoint.always",
  ENDPOINT_CHANGED: "endpoint.changed",
  FIELD_ADDED: "field.added",
  FIELD_CHANGED: "field.changed",
};

export class OpenAPIDSL extends DSL {
  private eventEmitter = new EventEmitter();

  run(changes: IChange[]) {
    super.run(changes);
    const report = this.report.bind(this);
    changes
      .filter((i) => i.location.kind === "endpoint" && i.added)
      .forEach((endpoint) => {
        const nodeValue = endpoint.added as OpenApiEndpointFact;
        const handlerValue: EndpointAddedValue = {
          pathPattern: nodeValue.pathPattern,
          method: nodeValue.method,
          maturity: nodeValue.maturity,
        };

        this.eventEmitter.emit(
          KEYS.ENDPOINT_ADDED,
          handlerValue,
          {},
          endpoint.location,
          (input: any) => report(input, endpoint.location)
        );

        this.eventEmitter.emit(
          KEYS.ENDPOINT_ALWAYS,
          handlerValue,
          {},
          endpoint.location,
          (input: any) => report(input, endpoint.location)
        );
      });
    changes
      .filter((i) => i.location.kind === "endpoint" && i.changed)
      .forEach((endpoint) => {
        const before = endpoint.changed!.before as OpenApiEndpointFact;
        const after = endpoint.changed!.after as OpenApiEndpointFact;
        this.eventEmitter.emit(
          KEYS.ENDPOINT_CHANGED,
          before,
          after,
          {},
          endpoint.location,
          (input: any) => report(input, endpoint.location)
        );
      });

    changes
      .filter((i) => i.location.kind === "endpoint" && i.changed)
      .filter((endpoint) => {
        this.eventEmitter.emit(
          KEYS.ENDPOINT_ALWAYS,
          endpoint.changed?.after!,
          {},
          endpoint.location,
          (input: any) => report(input, endpoint.location)
        );
      });
  }

  toHumanReadableChange(change: IChange): string | undefined {
    return undefined;
  }

  // endpoint rules
  endpointsAlways(handler: AlwaysHandler<EndpointAddedValue, {}>): void {
    this.eventEmitter.on(KEYS.ENDPOINT_ALWAYS, handler);
  }

  onEndpointAdded(handler: AddedHandler<EndpointAddedValue, {}>): void {
    this.eventEmitter.on(KEYS.ENDPOINT_ADDED, handler);
  }
  onEndpointChanged(handler: ChangedHandler<EndpointAddedValue, {}>): void {
    this.eventEmitter.on(KEYS.ENDPOINT_CHANGED, handler);
  }

  // field rules
  onFieldAdded(handler: AddedHandler<{}, FieldChangedContext>): void {
    this.eventEmitter.on(KEYS.FIELD_ADDED, handler);
  }
  onFieldChanged(handler: ChangedHandler<{}, FieldChangedContext>): void {
    this.eventEmitter.on(KEYS.FIELD_CHANGED, handler);
  }

  uses(attach: (guide: DSL) => void): void {
    attach(this);
  }
}

type EndpointAddedValue = {
  pathPattern: string;
  method: string;
  maturity?: string;
};

type FieldChangedContext = {
  path: string;
  method: string;
  operationId?: string;
  endpointMaturity?: string;
  inRequest: {
    contentType: string;
  };
  inResponse: {
    statusCode: number;
    contentType: string;
  };
};
