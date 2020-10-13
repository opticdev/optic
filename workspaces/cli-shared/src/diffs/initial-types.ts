export interface ILearnedBodies {
  pathId: string;
  method: string;
  requests: ILearnedBody[];
  responses: ILearnedBody[];
}

export interface ILearnedBody {
  contentType: string;
  statusCode?: number;
  commands: any[];
  rootShapeId: string;
}
