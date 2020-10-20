//todo one time export from scala js, switch to types from Rust

export interface IJsonTrail {
  path: IJsonTrailPathComponent[];
}

export type IJsonTrailPathComponent =
  | IJsonObjectKey
  | IJsonObject
  | IJsonArrayItem
  | IJsonArray;

export interface IJsonObjectKey {
  JsonObjectKey: {
    key: string;
  };
}

export interface IJsonObject {
  JsonObject: {};
}

export interface IJsonArrayItem {
  JsonArrayItem: {
    index: number;
  };
}

export interface IJsonArray {
  JsonArray: {};
}
