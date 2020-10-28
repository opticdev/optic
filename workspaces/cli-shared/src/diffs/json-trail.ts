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

//// Helpers
export function normalize(i: IJsonTrail): IJsonTrail {
  const newPath: IJsonTrailPathComponent[] = i.path.map(
    (item: IJsonTrailPathComponent) => {
      if ((item as IJsonArrayItem)['JsonArrayItem']) {
        const replacement: IJsonArrayItem = {
          JsonArrayItem: {
            index: 0,
          },
        };
        return replacement;
      } else {
        return item;
      }
    }
  );
  return { path: newPath };
}

export function toCommonJsPath(i: IJsonTrail): (string | number)[] {
  const components: (string | number)[] = [];
  i.path.forEach((item) => {
    if ((item as IJsonArrayItem).JsonArrayItem) {
      components.push((item as IJsonArrayItem).JsonArrayItem.index);
    }
    if ((item as IJsonObjectKey).JsonObjectKey) {
      components.push((item as IJsonObjectKey).JsonObjectKey.key);
    }
  });

  return components;
}
