import tap from "tap";
import { OpenAPITraverser } from "../openapi3/implementations/openapi3/openapi-traverser";
import { jsonFromFile } from "../openapi3/pipeline/spec-from";
import { parseOpenAPIWithSourcemap } from "../parser/openapi-sourcemap-parser";
import fs from 'fs-extra'

async function answerBasicQuestions(filePath: string) {
    tap.test(filePath, async (t) => {
        const fileContents = await jsonFromFile(filePath)();
        tap.test("original contents", (t) => {
            t.matchSnapshot(fileContents);
            t.end();
        })

        tap.test("snapshot facts", async (t) => {
            const traverser = new OpenAPITraverser();
            traverser.traverse(fileContents);
            tap.matchSnapshot(traverser.accumulator.allFacts());
            t.end();
        })

        t.end()
    })
}

async function main(inputs: string[]) {
    for (const input of inputs) {
        //await answerBasicQuestions(input);
        const flattened = await parseOpenAPIWithSourcemap(input);
        await fs.writeJson(input + '.flattened.json', flattened, { spaces: 2 });
        await fs.writeJson(input + '.flattened-without-sourcemap.json', flattened.jsonLike, { spaces: 2 });
    }
}

main([
    './inputs/openapi3/petstore0.json',
    './inputs/openapi3/private/snyk/org-id-versions/all-dates/0005.7-Sep-2021.9d9ffc5d0e817da468820b7936105af564dde349.spec.yaml',
    './inputs/openapi3/private/snyk/org-id-versions/all-dates/0006.7-Sep-2021.e0fdd67bf73bc26b378d93ecf4d502bef02823ca.spec.yaml',
    //'./inputs/openapi3/private/snyk/org-id-versions/all-dates/0010.5-Apr-2016.87e9639ddaa52f57f3fba1c704f757213c2681d5.spec.yaml',
    './inputs/openapi3/private/snyk/org-id-versions/all-dates/0003.16-Sep-2021.56fe23a8ee00f877771d1c021da0b21c9a9eaea0.spec.yaml',
    './inputs/openapi3/private/snyk/org-id-versions/all-dates/0001.1-Oct-2021.19ca0c13463b42ce1bd34d636ae5b3a5350a8784.spec.yaml',
    './inputs/openapi3/private/snyk/org-id-versions/all-dates/0009.16-Jul-2021.2c662df3651293281df8e55a5b2d0d77fe89a25d.spec.yaml',
    './inputs/openapi3/private/snyk/org-id-versions/all-dates/0004.14-Sep-2021.1f10caff83376ab5f38fd24d2d45521c82aa00bb.spec.yaml',
    './inputs/openapi3/private/snyk/org-id-versions/all-dates/0002.20-Sep-2021.b9febabad5b30b9f40e661ab288538976181c191.spec.yaml',
    './inputs/openapi3/private/snyk/org-id-versions/all-dates/0007.27-Aug-2021.9cf5f64b3c3ac1907884b35f7f509aff59266abb.spec.yaml',
    './inputs/openapi3/private/snyk/org-id-versions/all-dates/0008.18-Aug-2021.cf1155a0a237552603d90cda560e6184970c4879.spec.yaml',
]);