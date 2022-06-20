import { findOpenAPISpecs } from './find-openapi-specs';
import { generateOpticConfig } from './generate-optic-config';
import { writeOpticConfig } from './write-optic-config';

export const init = async (): Promise<void> => {
  const openApiSpecs = await findOpenAPISpecs();
  const opticConfig = generateOpticConfig(openApiSpecs);
  await writeOpticConfig(opticConfig);
};
