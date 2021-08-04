import { CQRSCommand } from '@useoptic/optic-domain';
import { IForkableSpectacle } from '@useoptic/spectacle';

export class SpectacleClient {
  constructor(private spectacle: IForkableSpectacle) {}

  public fetchRemoveEndpointCommands = async (
    pathId: string,
    method: string
  ): Promise<CQRSCommand[]> => {
    type EndpointProjection = {
      endpoint: {
        commands: {
          remove: CQRSCommand[];
        };
      } | null;
    };
    const results = await this.spectacle.query<
      EndpointProjection,
      {
        pathId: string;
        method: string;
      }
    >({
      query: `
      query X($pathId: ID!, $method: String!) {
        endpoint(pathId: $pathId, method: $method) {
          commands {
            remove
          }
        }
      }`,
      variables: {
        pathId,
        method,
      },
    });
    if (results.errors) {
      console.error(results.errors);
      throw new Error(JSON.stringify(results.errors));
    }
    if (!results.data || !results.data.endpoint) {
      const message = `Could not generate removal commands for endpoint path: ${pathId} and method: ${method}`;
      console.error(message);
      throw new Error(message);
    }
    return results.data.endpoint.commands.remove;
  };

  public fetchFieldRemoveCommands = async (
    fieldId: string
  ): Promise<CQRSCommand[]> => {
    type FieldCommands = {
      field: {
        commands: {
          remove: CQRSCommand[];
        };
      } | null;
    };

    const results = await this.spectacle.query<
      FieldCommands,
      {
        fieldId: string;
      }
    >({
      query: `
      query X($fieldId: ID!) {
        field(fieldId: $fieldId) {
          commands {
            remove
          }
        }
      }`,
      variables: {
        fieldId,
      },
    });
    if (results.errors) {
      console.error(results.errors);
      throw new Error(JSON.stringify(results.errors));
    }
    if (!results.data || !results.data.field) {
      const message = `Could not generate removal commands for field: ${fieldId}`;
      console.error(message);
      throw new Error(message);
    }
    return results.data.field.commands.remove;
  };
}
