import { parseOpenAPIWithSourcemap } from "./openapi-sourcemap-parser";
import path from "path";
import { sourcemapReader } from "./sourcemap-reader";

const fixture = async () => {
  return await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(
        __dirname,
        "../../inputs/openapi3-with-references/external-multiple.yaml"
      )
    )
  );
};

function stripCwd(file: string) {
  return file.replace(process.cwd(), "");
}

describe("reading sourcemaps", () => {
  it("can get file path of forign file for any pointer relative to flattened json", async () => {
    const results = await fixture();

    const node = sourcemapReader(results.sourcemap).findFile(
      "/properties/user/example/name"
    );

    expect(node!.filePath.endsWith("definitions.yaml")).toBeTruthy();
    expect(stripCwd(node!.filePath)).toMatchSnapshot();
  });

  it("can get file paths json pointer in main file relative to flattened json", async () => {
    const results = await fixture();

    const node = sourcemapReader(results.sourcemap).findFile("/properties");

    expect(node!.filePath.endsWith("external-multiple.yaml")).toBeTruthy();
    expect(stripCwd(node!.filePath)).toMatchSnapshot();
  });

  it("lines in affected file for sub-property", async () => {
    const results = await fixture();

    const node = await sourcemapReader(results.sourcemap).findFileAndLines(
      "/properties/user/example/name"
    );

    expect(node).toMatchSnapshot();
  });

  it("lines in affected for object", async () => {
    const results = await fixture();

    const node = await sourcemapReader(results.sourcemap).findFileAndLines(
      "/properties"
    );

    expect(node).toMatchSnapshot();
  });
});
