import path from 'path';
import { SynkApiCheckContext } from '../../dsl';
import { newSnykApiCheckService } from '../../service';
import { specFromInputToResults, parseSpecVersion } from '@useoptic/api-checks';
import {
  defaultEmptySpec,
  factsToChangelog,
  ResultWithSourcemap,
} from '@useoptic/openapi-utilities';
import { sourcemapReader } from '@useoptic/openapi-io';

describe('end-end-tests', () => {
  const inputsDir = path.resolve(
    path.join(__dirname, '../../../end-end-tests/api-standards')
  );

  const resourceDate = (resource: string, date: string) =>
    path.join(inputsDir, 'resources', resource, date);

  it('fails when operation is removed', async () => {
    expect(
      await snapshotScenario(
        '000-baseline.yaml',
        '001-fail-operation-removed.yaml',
        resourceDate('thing', '2021-11-10'),
        {
          changeDate: '2021-11-11',
          changeResource: 'thing',
          changeVersion: {
            date: '2021-11-10',
            stability: 'beta',
          },
          resourceVersions: {},
        },
        false
      )
    ).toMatchSnapshot();
  });

  it('fails when breaking param change', async () => {
    expect(
      await snapshotScenario(
        '000-baseline.yaml',
        '001-fail-breaking-param-change.yaml',
        resourceDate('thing', '2021-11-10'),
        {
          changeDate: '2021-11-11',
          changeResource: 'thing',
          changeVersion: {
            date: '2021-11-10',
            stability: 'beta',
          },
          resourceVersions: {},
        },
        true
      )
    ).toMatchSnapshot();
  });

  it('passes when property field added to response', async () => {
    expect(
      await snapshotScenario(
        '000-baseline.yaml',
        '001-ok-add-property-field.yaml',
        resourceDate('thing', '2021-11-10'),
        {
          changeDate: '2021-11-11',
          changeResource: 'thing',
          changeVersion: {
            date: '2021-11-10',
            stability: 'beta',
          },
          resourceVersions: {},
        },
        true
      )
    ).toMatchSnapshot();
  });

  it('passes when property operation added', async () => {
    const results = await snapshotScenario(
      '000-baseline.yaml',
      '002-ok-add-operation.yaml',
      resourceDate('thing', '2021-11-10'),
      {
        changeDate: '2021-11-11',
        changeResource: 'thing',
        changeVersion: {
          date: '2021-11-10',
          stability: 'beta',
        },
        resourceVersions: {},
      },
      true
    );

    // expect(results.filter((i) => !i.passed)).toHaveLength(0);
    expect(results).toMatchSnapshot();
  });

  async function snapshotScenario(
    from: string | undefined,
    to: string | undefined,
    workingDir: string,
    context: SynkApiCheckContext,
    shouldPass: boolean
  ) {
    const fromSpecSig = parseSpecVersion(from, defaultEmptySpec);
    const fromSpec = await specFromInputToResults(fromSpecSig, workingDir);
    const toSpecSig = parseSpecVersion(to, defaultEmptySpec);
    const toSpec = await specFromInputToResults(toSpecSig, workingDir);

    const checkService = newSnykApiCheckService();
    const { currentFacts, nextFacts } = checkService.generateFacts(
      fromSpec.jsonLike,
      toSpec.jsonLike
    );
    const checkResults = await checkService.runRulesWithFacts({
      context,
      nextFacts,
      currentFacts,
      changelog: factsToChangelog(currentFacts, nextFacts),
      nextJsonLike: toSpec.jsonLike,
      currentJsonLike: fromSpec.jsonLike,
    });

    // helpful to in-source this when debugging
    // const currentTraverser = new OpenAPITraverser();
    // const nextTraverser = new OpenAPITraverser();
    //
    // await currentTraverser.traverse(fromSpec.jsonLike);
    // const currentFacts = currentTraverser.accumulator.allFacts();
    // await nextTraverser.traverse(toSpec.jsonLike);
    // const nextFacts = nextTraverser.accumulator.allFacts();
    //
    // const ft2l = factsToChangelog(
    //   currentFacts.filter(
    //     (i: any) => i.location.kind === OpenApiKind.Operation
    //   ),
    //   nextFacts.filter((i: any) => i.location.kind === OpenApiKind.Operation)
    // );

    const { findFileAndLines } = sourcemapReader(toSpec.sourcemap);
    const result: ResultWithSourcemap[] = await Promise.all(
      checkResults.map(async (checkResult) => {
        const sourcemap = await findFileAndLines(
          checkResult.change.location.jsonPath
        );

        const filePath = sourcemap?.filePath.split('end-end-tests')[1];

        // if (!filePath) {
        //   console.log(checkResult.change.location.jsonPath);
        //   console.log("not found");
        // }

        return {
          ...checkResult,
          sourcemap: {
            ...sourcemap,
            preview: '',
            filePath,
          },
          change: null as any,
        } as ResultWithSourcemap;
      })
    );
    return result;
  }
});
