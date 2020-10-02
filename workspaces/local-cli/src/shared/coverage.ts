import { IApiCliConfig, IPathMapping } from '@useoptic/cli-config';
import { developerDebugLogger, fromOptic } from '@useoptic/cli-shared';
import { cli } from 'cli-ux';
import path from 'path';
import fs from 'fs-extra';
import { opticEngine } from '@useoptic/domain';

export async function printCoverage(paths: IPathMapping, captureId: string) {
  cli.action.start(fromOptic('Calculating Coverage...'));
  const report = await getReport(paths, captureId);

  console.log(report);

  cli.action.stop();
}

async function getReport(paths: IPathMapping, captureId: string): Promise<any> {
  const capturesDirectory = path.join(paths.capturesPath, captureId);

  const entries = await fs.readdir(capturesDirectory);

  const coverageFiles = entries
    .filter((x) => x.startsWith('coverage-'))
    .map((x) => path.join(capturesDirectory, x));

  console.log(coverageFiles);

  const reportsToMerge = await Promise.all(
    coverageFiles.map(async (i) => {
      const coverageJSON = await fs.readJSON(i);
      const asScala = opticEngine.CoverageReportJsonDeserializer.fromJs(
        coverageJSON
      );
      return asScala;
    })
  );

  const report = opticEngine.CoverageReportBuilder.emptyReport();
  //merge in all the reports
  reportsToMerge.forEach((i) => report.merge(i));

  const finalReport = opticEngine.CoverageReportJsonSerializer.toJs(report);

  return finalReport;
}
