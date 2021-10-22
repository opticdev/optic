import tap = require('tap');
import { OpenAPIDSL } from '../openapi3/implementations/openapi3/OpenAPIDSL';
import { OpenAPITraverser } from '../openapi3/implementations/openapi3/OpenAPITraverser';
import { Check } from '../openapi3/pipeline/check';
import { jsonFromFile } from '../openapi3/pipeline/SpecFrom';
import { factsToChangelog } from '../openapi3/sdk/facts-to-changelog';
import { ComposableGuide, Issue, Warning } from '../openapi3/sdk/types';

///////////////////////////////////////////////////////////////////////////////

const { guide, runCheck } = Check()
    .compareChangesIn(jsonFromFile("./inputs/openapi3/smallpetstore0.json"))
    .to(jsonFromFile("./inputs/openapi3/smallpetstore1.json"))
    .withTraverser(OpenAPITraverser)
    .withGuideFor(OpenAPIDSL);

const pathNameRules: ComposableGuide = (guide: OpenAPIDSL) => {
    guide.onEndpointAdded((node, context, location, report) => {
        // ensure no capitalization in path pattern
        if (node.pathPattern.toLocaleLowerCase() !== node.pathPattern) {
            report(
                Issue(
                    `new endpoint violates rule: No capitalization in path parameter ${node.method} ${node.pathPattern}`
                )
            );
        }

        if (node.pathPattern.includes("-") || node.pathPattern.includes("_")) {
            report(
                Issue(
                    `new endpoint violates rule: No special chars (-_) in path pattern ${node.method} ${node.pathPattern}`
                )
            );
        }

        if (node.method === "put") {
            report(
                Issue(`new endpoint violates rule: We do not use PUT as an API method`)
            );
        }
    });
};

const snykMaturityRules: ComposableGuide = (guide: OpenAPIDSL) => {
    // every endpoints must have maturity
    guide.endpointsAlways((node, context, location, report) => {
        if (!["wip", "beta", "stable", "deprecated"].includes(node.maturity || ""))
            report(
                Issue(
                    'Endpoints must have a maturity, either ["wip", "beta", "stable", "deprecated"]'
                )
            );
    });

    // when a new endpoint is added, maturity is always wip or beta
    guide.onEndpointAdded((node, context, location, report) => {
        if (node.maturity && !["wip", "beta"].includes(node.maturity)) {
            report(Warning("New endpoints should start out as wip or beta"));
        }
    });

    // endpoint maturity is never regressed
    guide.onEndpointChanged((last, current, context, location, report) => {
        if (!current.maturity) {
            return report(Issue("Endpoints must have our maturity field"));
        }

        // already stable
        if (["stable", "deprecated"].includes(last.maturity || "")) {
            // moving to unstable
            if (["wip", "beta"].includes(current.maturity || ""))
                return report(Issue("Stable endpoints can not be changed to unstable"));
        }
    });

    guide.onFieldAdded((node, context, location, report) => {
        const breaking = Boolean(context.inRequest);

        if (
            breaking &&
            ["stable", "deprecated"].includes(context.endpointMaturity || "")
        ) {
            return Issue("No breaking changes to stable or deprecated endpoints");
        }
    });

    guide.onFieldChanged((last, current, context, location, report) => {
        const breaking = isBreaking(last, current, context);
        if (
            breaking &&
            ["stable", "deprecated"].includes(context.endpointMaturity || "")
        ) {
            return Issue("No breaking changes to stable or deprecated endpoints");
        }
    });
};

// look at how composable this is
guide.uses(pathNameRules);
guide.uses(snykMaturityRules);

tap.test("runs", async () => {
    console.log(process.cwd());
    const results = await runCheck();

    console.log(JSON.stringify(results, null, 4));
});

function isBreaking(last: any, current: any, context: any): boolean {
    return true;
}

///////////////////////////////////////////////////////////////////////////////

tap.test("can compute a changelog from facts", async () => {
  async function factsFromOAI(path: string) {
    const traverser = new OpenAPITraverser();
    traverser.traverse(await traverser.prepare(await jsonFromFile(path)()));
    return traverser.accumulator.allFacts();
  }

  const facts1 = await factsFromOAI("./inputs/openapi3/smallpetstore0.json");
  const facts2 = await factsFromOAI("./inputs/openapi3/smallpetstore1.json");

  const changelog = factsToChangelog(facts1, facts2);

  tap.matchSnapshot(changelog);
});
