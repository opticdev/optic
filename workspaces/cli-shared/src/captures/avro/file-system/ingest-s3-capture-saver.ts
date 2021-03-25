import fs from 'fs-extra';
import { cli } from 'cli-ux';
import { Readable } from 'stream';
import { getPathsRelativeToConfig } from '@useoptic/cli-config';
import { IgnoreFileHelper } from '@useoptic/cli-config/build/helpers/ignore-file-interface';
import path from 'path';
import { parser as jsonlParser } from 'stream-json/jsonl/Parser';
import { map as streamMap, flatMap } from 'axax';
import { IHttpInteraction } from '@useoptic/domain-types';
//@ts-ignore
import AWS from 'aws-sdk';
import { CaptureSaver } from './capture-saver';
import { Token as ContinuationToken } from 'aws-sdk/clients/s3';
import { parseIgnore } from '@useoptic/cli-config/build/helpers/ignore-parser';

export async function ingestS3({
  bucketName,
  region,
  captureId,
  pathPrefix,
  endpointOverride,
}: {
  bucketName: string;
  region?: string;
  captureId: string;
  pathPrefix?: string;
  endpointOverride?: string;
}) {
  let {
    capturesPath: capturesBaseDirectory,
    opticIgnorePath,
    configPath,
  } = await getPathsRelativeToConfig();

  let { allRules } = await new IgnoreFileHelper(
    opticIgnorePath,
    configPath
  ).getCurrentIgnoreRules();
  let { shouldIgnore } = parseIgnore(allRules);

  AWS.config.update({ region });

  // Apparently we need to include the bucket here...
  // Doesn't work if we leave it off and just pass to `listObjectsV2` :s
  const s3 = new AWS.S3(
    endpointOverride
      ? {
          endpoint: `${endpointOverride}/${bucketName}`,
          s3BucketEndpoint: true,
        }
      : undefined
  );

  const captureSaver = new CaptureSaver({
    captureBaseDirectory: capturesBaseDirectory,
    captureId,
  });
  await captureSaver.init();

  const prefix = `${path.join(pathPrefix ?? '', captureId ?? '')}`;

  console.log(
    `Looking in s3://${bucketName}${prefix} in region ${region}, ${
      endpointOverride ?? ''
    }`
  );

  const customBar = cli.progress({
    format:
      'Ingesting | {bar} | {value}/{total} batches, {interactions} interactions',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  });

  let interactionCount = 0;
  let batchCount = 0;
  let totalBatches = 0;

  async function* bucket_keys(
    cursor?: ContinuationToken
  ): AsyncIterable<string> {
    const objects = await s3
      .listObjectsV2({
        Bucket: bucketName,
        MaxKeys: 1000,
        Prefix: prefix,
        ContinuationToken: cursor,
      })
      .promise();

    let batch_files =
      objects.Contents?.map((c) => c?.Key).filter((o): o is string => !!o) ??
      [];
    totalBatches += batch_files.length;

    customBar.setTotal(totalBatches);

    for (const batch of batch_files) {
      yield batch;
      batchCount++;
      customBar.update(batchCount);
    }

    if (objects.IsTruncated) {
      yield* bucket_keys(objects.NextContinuationToken);
    }
  }

  function key_to_readstream(key: string): Readable {
    return s3
      .getObject({
        Bucket: bucketName,
        Key: key,
      })
      .createReadStream();
  }

  let continuous_readable: Readable = Readable.from(
    flatMap(key_to_readstream)(bucket_keys())
  );
  let parser = continuous_readable.pipe(jsonlParser());
  let obj_stream = streamMap((obj: { value: IHttpInteraction }) => obj.value)(
    parser
  );

  customBar.start(0, 0, { interactions: 0 });

  for await (const interaction of obj_stream) {
    if (!shouldIgnore(interaction.request.method, interaction.request.path)) {
      captureSaver.save(interaction);
      interactionCount++;
      customBar.update({ interactions: interactionCount });
    }
  }

  customBar.stop();

  console.log(
    `Successfully loaded ${interactionCount} interaction events from your bucket!`
  );

  const files = [
    {
      location: path.join(
        capturesBaseDirectory,
        captureId,
        'optic-capture-state.json'
      ),
      contents: JSON.stringify({
        captureId,
        status: 'completed',
        metadata: {
          startedAt: new Date().toISOString(),
          taskConfig: null,
          lastInteraction: null,
        },
      }),
    },
  ];

  await Promise.all(
    files.map(async (x) => {
      const { location, contents } = x;
      await fs.ensureDir(path.dirname(location));
      return fs.writeFile(location, contents);
    })
  );

  return interactionCount;
}
