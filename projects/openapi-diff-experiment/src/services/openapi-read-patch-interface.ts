import { ISpecReader } from './read/types';
import { IPatchOpenAPI, IPatchOpenAPIReconcilerFactory } from './patch/types';
import { createOpenApiPatch } from './patch/patch';

export type SpecInterface = {
  read: ISpecReader;
  patch: IPatchOpenAPI;
  resetPatch: () => Promise<void>;
};

export type SpecInterfaceFactory = () => Promise<SpecInterface>;

export async function OpenApiInterface(
  reader: ISpecReader,
  reconcilerFactory: IPatchOpenAPIReconcilerFactory
): Promise<SpecInterface> {
  const didLoad = await reader.didLoad();

  if (!didLoad.success) throw new Error('Could not load spec');

  if (didLoad.success) {
    let patch = await createOpenApiPatch(reader, reconcilerFactory(reader));

    return {
      read: reader,
      get patch() {
        return patch;
      },
      resetPatch: async () => {
        patch = await createOpenApiPatch(reader, reconcilerFactory(reader));
      },
    };
  }
}
