import { initSegment } from '@useoptic/openapi-utilities/build/utilities/segment';

export * from './workflows';
export { updateByExampleCommand as updateCommand } from './commands/update-by-example';
export { OpenAPIV3 } from './specs';

initSegment(process.env.OPTIC_OPENCLI_SEGMENT_KEY);
