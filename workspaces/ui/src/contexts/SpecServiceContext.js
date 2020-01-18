import {GenericContextFactory} from './GenericContextFactory';

const {
  Context: SpecServiceContext,
  withContext: withSpecServiceContext
} = GenericContextFactory(null);

export {
  withSpecServiceContext,
  SpecServiceContext,
};
