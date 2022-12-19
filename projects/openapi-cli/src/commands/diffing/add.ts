import { Err, Ok, Result } from 'ts-results';
import { HttpMethod, HttpMethods } from '../../operations';

export async function addIfUndocumented(
  parsedOperations: ParsedOperation[],
  flags: { all: boolean }
) {
  const all = flags.all;
  if (flags.all) {
    const undocumented = await computeUndocumented();
  } else {
    // iterate over all of them...
  }
}

interface ParsedOperation {
  methods: Array<HttpMethod>;
  pathPattern: string;
}

function parseAddOperations(
  rawComponents: string[]
): Result<ParsedOperation[], string> {
  const components = rawComponents.filter((s) => s.length > 0);
  const pairs: ParsedOperation[] = [];

  for (let i = 0; i < Math.ceil(components.length / 2); i++) {
    let rawMethods = components[i * 2];
    let pathPattern = components[i * 2 + 1];

    if (!pathPattern) {
      return Err(
        'missing path pattern or method. Pairs of valid method(s) and path required to add an operation'
      );
    }

    if (!pathPattern.startsWith('/')) pathPattern = '/' + pathPattern;

    let methods: Array<HttpMethod> = [];
    for (let maybeMethod of rawMethods.split(',')) {
      let method = HttpMethods[maybeMethod.toUpperCase()];
      if (!method) {
        return Err(
          `could not parse '${maybeMethod}' as a valid HTTP method. Pairs of valid method(s) and path required to add an operation`
        );
      }
      methods.push(method as HttpMethod);
    }

    let pair = { methods, pathPattern };
    pairs.push(pair);
  }

  return Ok(pairs);
}

export async function computeUndocumented() {}

// observations to diffs

// parsing the --add flag

// applying the patch

// report on undocumented
