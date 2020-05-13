import { Command } from '@oclif/command';
import { setupTask } from '../../shared/run-task';
import * as uuid from 'uuid';
import { Client as SaasClient } from '@useoptic/saas-client';
import { developerDebugLogger } from '../../shared/logger';

export default class Start extends Command {
  static description =
    'starts your API process behind a proxy and sends traffic metadata to the cloud';

  async run() {
    process.env.OPTIC_PERSISTENCE_METHOD = 'saas';

    const gatewayBaseUrl =
      'https://k2shife0j5.execute-api.us-east-1.amazonaws.com/stage';
    const baseUrl = `${gatewayBaseUrl}/api/v1`;
    process.env.OPTIC_SAAS_API_BASE_URL = baseUrl;

    const agentGroupId = 'pokeapi-crawler';
    const orgId = 'optic-testing';
    const captureId = uuid.v4();
    const reportUrl = `${baseUrl}/capture-reports/orgs/${orgId}/agentGroups/${agentGroupId}/captures/${captureId}`;
    this.log(`Access your report at ${reportUrl}`);
    const tokenContents = {
      agentGroupId,
      orgId,
      captureId,
    };
    const tokenString = Buffer.from(JSON.stringify(tokenContents)).toString(
      'base64'
    );
    process.env.OPTIC_SAAS_LAUNCH_TOKEN = tokenString;
    process.env.OPTIC_SAAS_AGENT_GROUP_ID = agentGroupId;
    process.env.OPTIC_SAAS_ORG_ID = orgId;
    process.env.OPTIC_SAAS_CAPTURE_ID = captureId;

    const saasClient = new SaasClient(baseUrl, tokenString);
    developerDebugLogger('getting spec upload url');
    const { uploadUrl } = await saasClient.getSpecUploadUrl();
    developerDebugLogger('uploading spec');
    await saasClient.uploadSpec(uploadUrl, []);
    await setupTask(this, 'start');
    this.log(`Access your report at ${reportUrl}`);
  }
}
