import * as jsonPointer from "json-pointer";
import jsonPointerHelpers from "./json-pointer-helpers";

describe("json schema pointer assumptions", () => {
  it("can be trusted to escape symbols common in OpenAPI", () => {
    const result = jsonPointer.compile(["1", "/example/{todo}", "200"]);
    expect(result).toMatchSnapshot();
  });
  it("compiling an empty array returns an empty path", () => {
    const result = jsonPointer.compile([]);
    expect(result).toMatchSnapshot();
  });

  it("decoding an empty string returns an empty path", () => {
    const result = jsonPointer.parse("");
    expect(result).toMatchSnapshot();
  });
});

describe("json schema pointer helpers", () => {
  it("appends are escaped", () => {
    expect(
      jsonPointerHelpers.append("/paths", "/example/{todoId}", "get")
    ).toMatchSnapshot();
  });

  it("can cleanup stoplights mess", () => {
    const result = jsonPointerHelpers.unescapeUriSafePointer(
      "#/paths/~1pet~1%7BpetId%7D~1uploadImage/post/responses/200/content/application~1json/schema/properties"
    );
    expect(result).toMatchSnapshot();
  });
});
