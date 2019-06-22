import {GenericContextFactory} from './GenericContextFactory.js';

const {
    Context: PathContext,
    withContext: withPathContext
} = GenericContextFactory(null)

export {
    PathContext,
    withPathContext
}