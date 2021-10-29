import tap from "tap";
import { OpenAPITraverser } from "../openapi3/implementations/openapi3/openapi-traverser";
import { jsonFromFile } from "../openapi3/pipeline/SpecFrom";


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
        await answerBasicQuestions(input);
    }
}

main([
    './inputs/openapi3/private/snyk/experimental.json',
    //'./inputs/openapi3/empty.json',
]);