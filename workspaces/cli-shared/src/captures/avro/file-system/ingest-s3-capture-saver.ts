import fs from 'fs-extra';
import stream, { Readable, Writable } from "stream";
import { getPathsRelativeToConfig, parseRule } from '@useoptic/cli-config';
import { IgnoreFileHelper } from '@useoptic/cli-config/build/helpers/ignore-file-interface';
import path from 'path';
import { IHttpInteraction } from '@useoptic/domain-types';
//@ts-ignore
import oboe from 'oboe';
import AWS, { Endpoint } from "aws-sdk";
import { CaptureSaver } from './capture-saver';
import { Token as ContinuationToken, Object as S3Object } from 'aws-sdk/clients/s3';
import { Command } from "commander";
import { IIgnoreRunnablePredicate } from '@useoptic/cli-config/build/helpers/ignore-parser';

export async function ingestS3({ 
  bucketName, 
  region, 
  captureId, 
  pathPrefix, 
  endpointOverride
}: {
  bucketName: string,
  region?: string,
  captureId: string,
  pathPrefix?: string,
  endpointOverride?: string
}) {
  let { capturesPath: capturesBaseDirectory, opticIgnorePath, configPath } = await getPathsRelativeToConfig();

  let ignoreRules = await new IgnoreFileHelper(opticIgnorePath, configPath).getCurrentIgnoreRules();
  let parsedRules = ignoreRules
    .allRules
    .map(r => parseRule(r))
    .filter((r): r is IIgnoreRunnablePredicate => r !== undefined);

  AWS.config.update({ region });

  // Apparently we need to include the bucket here...
  // Doesn't work if we leave it off and just pass to `listObjectsV2` :s
  const s3 = new AWS.S3(endpointOverride ? { endpoint: `${endpointOverride}/${bucketName}`, s3BucketEndpoint: true } : undefined);

  const captureSaver = new CaptureSaver({
    captureBaseDirectory: capturesBaseDirectory,
    captureId,
  });
  await captureSaver.init();

  const prefix = `${path.join(pathPrefix ?? "", captureId ?? "")}`;

  console.log(`Looking in s3://${bucketName}${prefix} in region ${region}, ${endpointOverride ?? ''}`);

  const listAll = async (token?: ContinuationToken): Promise<S3Object[]> => {
    const objects = await s3.listObjectsV2({
      Bucket: bucketName,
      MaxKeys: 100,
      Prefix: prefix,
      ContinuationToken: token
    }).promise();
    if (objects.Contents) {
      console.log(`Found ${objects.Contents.length} capture files to ingest.`);
      if (objects.IsTruncated) {
        let rest = await listAll(objects.NextContinuationToken);
        return objects.Contents.concat(rest);
      } else {
        return objects.Contents;
      }
    } else {
      console.log("No object contents?");
      return [];
    }
  }

  let allObjects = await listAll();
  let objectsHandled = 0;
  let passThrough = new stream.PassThrough();

  let fetchPump = async () => {
    for (const obj of allObjects) {
      if (obj.Key) {
        let objReadStream = s3.getObject({
          Bucket: bucketName,
          Key: obj.Key
        }).createReadStream();
        await pipeAsync(objReadStream, passThrough);
        objectsHandled++;
        console.log(`Handled ${objectsHandled}/${allObjects.length} files`);
      }
    }
  }

  const oboePromose = new Promise<void>((resolve, reject) => {
    oboe(passThrough)
      .node('!', (row: IHttpInteraction) => {
        if (!parsedRules.some(r => r.shouldIgnore(row.request.method, `${row.request.host}${row.request.path}?${row.request.query}`))) {
          captureSaver.save(row);
        }
      })
      .on('done', function () {
        resolve();
      })
      .on('fail', function (e: any) {
        console.error(e);
        reject(e);
      });
  });

  await Promise.all([fetchPump(), oboePromose]);

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
}

async function pipeAsync(tap: Readable, sink: Writable) {
  return new Promise((resolve, reject) => {
    tap.pipe(sink, { end: false })
    tap.on("end", resolve)
    tap.on("error", reject)
  })
}