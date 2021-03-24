import { Command, flags } from '@oclif/command';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { ingestS3 } from "@useoptic/cli-shared/build/captures/avro/file-system/ingest-s3-capture-saver";
import { lockFilePath } from '../../shared/paths';
import { Config } from '../../config';
import { cleanupAndExit, makeUiBaseUrl } from '@useoptic/cli-shared';
import { getPathsRelativeToConfig } from '@useoptic/cli-config';
import { Client } from '@useoptic/cli-client';
import { getUser } from '../../shared/analytics';
import openBrowser from 'react-dev-utils/openBrowser';
export default class IngestS3 extends Command {
  static description = 'Ingest from S3';
  static hidden: boolean = true;

  static flags = {
    bucketName: flags.string({ required: true, char: "b" }),
    region: flags.string({ char: "r" }),
    captureId: flags.string({ char: "c", required: true }),
    pathPrefix: flags.string({ required: false }),
    endpointOverride: flags.string({ required: false })
  }

  async run() {
    try {
      const { flags: {
        bucketName,
        region,
        captureId,
        pathPrefix,
        endpointOverride
      } } = this.parse(IngestS3);

      await ingestS3({
        bucketName,
        region,
        captureId,
        pathPrefix,
        endpointOverride
      });

      const daemonState = await ensureDaemonStarted(lockFilePath, Config.apiBaseUrl);

      const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
      const paths = await getPathsRelativeToConfig();
      const cliClient = new Client(apiBaseUrl);
      cliClient.setIdentity(await getUser());
      const cliSession = await cliClient.findSession(paths.cwd, null, null);
      const uiBaseUrl = makeUiBaseUrl(daemonState);
      const uiUrl = `${uiBaseUrl}/apis/${cliSession.session.id}/dashboard`;
      openBrowser(uiUrl);
      cleanupAndExit();
    } catch (e) {
      this.error(e);
    }
  }
}
