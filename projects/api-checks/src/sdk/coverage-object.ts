type IPath = (string | number)[];

type HasCoverage = { _coverage: IPath[] };
export function wrapObjectInCoverageProxy<A>(
  obj: A,
  base: IPath = [],
  paths: Set<IPath> = new Set()
): A & HasCoverage {
  const handler = {
    get(target: any, prop: string | symbol) {
      if (prop === "_coverage") {
        return Array.from(paths).sort();
      }

      const child = Reflect.get(target, prop);
      const thisPath = [...base, prop.toString()];

      if (child) {
        if (Array.isArray(target) && isNaN(Number(prop.toString()))) {
          // skip
        } else {
          paths.add(thisPath);
        }
      }
      if (child && (isObject(child) || Array.isArray(child))) {
        return wrapObjectInCoverageProxy(child, thisPath, paths);
      } else {
        return child;
      }
    },
  };

  return new Proxy(obj, handler) as A & HasCoverage;
}

function isObject(a: any) {
  return !!a && a.constructor === Object;
}
