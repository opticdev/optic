import * as jsonPointer from "json-pointer";

it("works", () => {
  jsonPointer.compile(["1", "hello", "world"]);
});
