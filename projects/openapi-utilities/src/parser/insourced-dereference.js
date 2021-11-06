"use strict";

const $Ref = require("@apidevtools/json-schema-ref-parser/lib/ref");
const Pointer = require("@apidevtools/json-schema-ref-parser/lib/pointer");
const { ono } = require("@jsdevtools/ono");
const url = require("@apidevtools/json-schema-ref-parser/lib/util/url");

module.exports = { dereference };

/**
 * Crawls the JSON schema, finds all JSON references, and dereferences them.
 * This method mutates the JSON schema object, replacing JSON references with their resolved value.
 *
 * @param {$RefParser} parser
 * @param {$RefParserOptions} options
 */
function dereference(parser, options, sourcemap) {
  // console.log('Dereferencing $ref pointers in %s', parser.$refs._root$Ref.path);
  let dereferenced = crawl(
    parser.schema,
    parser.$refs._root$Ref.path,
    "#",
    new Set(),
    new Set(),
    new Map(),
    parser.$refs,
    sourcemap,
    options
  );

  parser.$refs.circular = dereferenced.circular;
  parser.schema = dereferenced.value;
}

/**
 * Recursively crawls the given value, and dereferences any JSON references.
 *
 * @param {*} obj - The value to crawl. If it's not an object or array, it will be ignored.
 * @param {string} path - The full path of `obj`, possibly with a JSON Pointer in the hash
 * @param {string} pathFromRoot - The path of `obj` from the schema root
 * @param {Set<object>} parents - An array of the parent objects that have already been dereferenced
 * @param {Set<object>} processedObjects - An array of all the objects that have already been processed
 * @param {Map<string,object>} dereferencedCache - An map of all the dereferenced objects
 * @param {$Refs} $refs
 * @param {$RefParserOptions} options
 * @returns {{value: object, circular: boolean}}
 */
function crawl(
  obj,
  path,
  pathFromRoot,
  parents,
  processedObjects,
  dereferencedCache,
  $refs,
  sourcemap,
  options
) {
  let dereferenced;
  let result = {
    value: obj,
    circular: false,
  };

  sourcemap.log(path, pathFromRoot);

  if (options.dereference.circular === "ignore" || !processedObjects.has(obj)) {
    if (obj && typeof obj === "object" && !ArrayBuffer.isView(obj)) {
      parents.add(obj);
      processedObjects.add(obj);

      if ($Ref.isAllowed$Ref(obj, options)) {
        dereferenced = dereference$Ref(
          obj,
          path,
          pathFromRoot,
          parents,
          processedObjects,
          dereferencedCache,
          $refs,
          sourcemap,
          options
        );
        result.circular = dereferenced.circular;
        result.value = dereferenced.value;
      } else {
        for (const key of Object.keys(obj)) {
          let keyPath = Pointer.join(path, key);
          let keyPathFromRoot = Pointer.join(pathFromRoot, key);
          let value = obj[key];
          let circular = false;

          if ($Ref.isAllowed$Ref(value, options)) {
            dereferenced = dereference$Ref(
              value,
              keyPath,
              keyPathFromRoot,
              parents,
              processedObjects,
              dereferencedCache,
              $refs,
              sourcemap,
              options
            );
            circular = dereferenced.circular;
            // Avoid pointless mutations; breaks frozen objects to no profit
            if (obj[key] !== dereferenced.value) {
              obj[key] = dereferenced.value;
            }
          } else {
            if (!parents.has(value)) {
              dereferenced = crawl(
                value,
                keyPath,
                keyPathFromRoot,
                parents,
                processedObjects,
                dereferencedCache,
                $refs,
                sourcemap,
                options
              );
              circular = dereferenced.circular;
              // Avoid pointless mutations; breaks frozen objects to no profit
              if (obj[key] !== dereferenced.value) {
                obj[key] = dereferenced.value;
              }
            } else {
              circular = foundCircularReference(keyPath, $refs, options);
            }
          }

          // Set the "isCircular" flag if this or any other property is circular
          result.circular = result.circular || circular;
        }
      }

      parents.delete(obj);
    }
  }

  return result;
}

/**
 * Dereferences the given JSON Reference, and then crawls the resulting value.
 *
 * @param {{$ref: string}} $ref - The JSON Reference to resolve
 * @param {string} path - The full path of `$ref`, possibly with a JSON Pointer in the hash
 * @param {string} pathFromRoot - The path of `$ref` from the schema root
 * @param {Set<object>} parents - An array of the parent objects that have already been dereferenced
 * @param {Set<object>} processedObjects - An array of all the objects that have already been dereferenced
 * @param {Map<string,object>} dereferencedCache - An map of all the dereferenced objects
 * @param {$Refs} $refs
 * @param {$RefParserOptions} options
 * @returns {{value: object, circular: boolean}}
 */
function dereference$Ref(
  $ref,
  path,
  pathFromRoot,
  parents,
  processedObjects,
  dereferencedCache,
  $refs,
  sourcemap,
  options
) {
  // console.log('Dereferencing $ref pointer "%s" at %s', $ref.$ref, path);

  let $refPath = url.resolve(path, $ref.$ref);

  const cache = dereferencedCache.get($refPath);
  if (cache) {
    const refKeys = Object.keys($ref);
    if (refKeys.length > 1) {
      const extraKeys = {};
      for (let key of refKeys) {
        if (key !== "$ref" && !(key in cache.value)) {
          extraKeys[key] = $ref[key];
        }
      }
      return {
        circular: cache.circular,
        value: Object.assign({}, cache.value, extraKeys),
      };
    }

    return cache;
  }

  let pointer = $refs._resolve($refPath, path, options);

  if (pointer === null) {
    return {
      circular: false,
      value: null,
    };
  }

  // Check for circular references
  let directCircular = pointer.circular;
  let circular = directCircular || parents.has(pointer.value);
  circular && foundCircularReference(path, $refs, options);

  // Dereference the JSON reference
  let dereferencedValue = $Ref.dereference($ref, pointer.value);

  // Crawl the dereferenced value (unless it's circular)
  if (!circular) {
    // Determine if the dereferenced value is circular
    let dereferenced = crawl(
      dereferencedValue,
      pointer.path,
      pathFromRoot,
      parents,
      processedObjects,
      dereferencedCache,
      $refs,
      sourcemap,
      options
    );
    circular = dereferenced.circular;
    dereferencedValue = dereferenced.value;
  }

  if (
    circular &&
    !directCircular &&
    options.dereference.circular === "ignore"
  ) {
    // The user has chosen to "ignore" circular references, so don't change the value
    dereferencedValue = $ref;
  }

  if (directCircular) {
    // The pointer is a DIRECT circular reference (i.e. it references itself).
    // So replace the $ref path with the absolute path from the JSON Schema root
    dereferencedValue.$ref = pathFromRoot;
  }

  const dereferencedObject = {
    circular,
    value: dereferencedValue,
  };

  // only cache if no extra properties than $ref
  if (Object.keys($ref).length === 1) {
    dereferencedCache.set($refPath, dereferencedObject);
  }

  return dereferencedObject;
}

/**
 * Called when a circular reference is found.
 * It sets the {@link $Refs#circular} flag, and throws an error if options.dereference.circular is false.
 *
 * @param {string} keyPath - The JSON Reference path of the circular reference
 * @param {$Refs} $refs
 * @param {$RefParserOptions} options
 * @returns {boolean} - always returns true, to indicate that a circular reference was found
 */
function foundCircularReference(keyPath, $refs, options) {
  $refs.circular = true;
  if (!options.dereference.circular) {
    throw ono.reference(`Circular $ref pointer found at ${keyPath}`);
  }
  return true;
}
