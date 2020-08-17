import { DescribeEvent, RegisteredEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';
// @ts-ignore
import * as Joi from '@hapi/joi';
import 'joi-extract-type';

// Sent whenever an API is created
const UserChangedCaptureOverviewTabSchema = Joi.object({
  currentTab: Joi.string().required(),
  diffCount: Joi.number().required(),
  undocumentedUrlCount: Joi.number().required(),
});
type UserChangedCaptureOverviewTabProperties = Joi.extractType<
  typeof UserChangedCaptureOverviewTabSchema
>;
export const UserChangedCaptureOverviewTab = DescribeEvent<
  UserChangedCaptureOverviewTabProperties
>(
  Events.UserChangedCaptureOverviewTab,
  UserChangedCaptureOverviewTabSchema,
  (props) =>
    `User changed to ${props.currentTab} and there are ${props.diffCount} diffs + ${props.undocumentedUrlCount} undocumented urls`
);

const NewBodyDiffRenderedSchema = Joi.object({
  requestCount: Joi.number().required(),
  responseCount: Joi.number().required(),
  regions: Joi.array().required().items(Joi.string()),
});
type NewBodyDiffRenderedProperties = Joi.extractType<
  typeof NewBodyDiffRenderedSchema
>;
export const NewBodyDiffRendered = DescribeEvent<NewBodyDiffRenderedProperties>(
  Events.NewBodyDiffRendered,
  NewBodyDiffRenderedSchema,
  (props) => `Diff was rendered in regions ${props.regions.join(', \n')}`
);

const InferPolymorphismEnabledSchema = Joi.object({
  captureId: Joi.string().required(),
  endpointId: Joi.string().required(),
});
type InferPolymorphismEnabledProperties = Joi.extractType<
  typeof InferPolymorphismEnabledSchema
>;
export const InferPolymorphismEnabled = DescribeEvent<
  InferPolymorphismEnabledProperties
>(
  Events.InferPolymorphismEnabled,
  InferPolymorphismEnabledSchema,
  (props) =>
    `Infer Polymorphism was turned on for ${props.captureId}, endpoint ${props.endpointId}`
);

const UserBeganAddingNewUrlSchema = Joi.object({
  captureId: Joi.string().required(),
  method: Joi.string().required(),
  path: Joi.string().required(),
  knownPathId: Joi.string().optional(),
});
type UserBeganAddingNewUrlProperties = Joi.extractType<
  typeof UserBeganAddingNewUrlSchema
>;
export const UserBeganAddingNewUrl = DescribeEvent<
  UserBeganAddingNewUrlProperties
>(
  Events.UserBeganAddingNewUrl,
  UserBeganAddingNewUrlSchema,
  (props) =>
    `User Began Adding New Url ${props.method} ${props.path} in ${props.captureId}`
);

const UserFinishedAddingNewUrlSchema = Joi.object({
  purpose: Joi.string().required(),
  captureId: Joi.string().required(),
  method: Joi.string().required(),
  pathExpression: Joi.string().optional(),
});
type UserFinishedAddingNewUrlProperties = Joi.extractType<
  typeof UserFinishedAddingNewUrlSchema
>;
export const UserFinishedAddingNewUrl = DescribeEvent<
  UserFinishedAddingNewUrlProperties
>(
  Events.UserFinishedAddingNewUrl,
  UserFinishedAddingNewUrlSchema,
  (props) =>
    `User Added New Url ${props.method} ${props.pathExpression} in ${props.captureId} with purpose '${props.pathExpression}'`
);

const SuggestionAcceptedSchema = Joi.object({
  captureId: Joi.string().required(),
  suggestion: Joi.string().required(),
});
type SuggestionAcceptedProperties = Joi.extractType<
  typeof SuggestionAcceptedSchema
>;
export const SuggestionAccepted = DescribeEvent<SuggestionAcceptedProperties>(
  Events.SuggestionAccepted,
  SuggestionAcceptedSchema,
  (props) => `Suggestion to '${props.suggestion}' was accepted`
);

const PreviewSuggestionSchema = Joi.object({
  captureId: Joi.string().required(),
  diff: Joi.string().required(),
  diffAssertion: Joi.string().required(),
  suggestion: Joi.string().required(),
});
type PreviewSuggestionProperties = Joi.extractType<
  typeof PreviewSuggestionSchema
>;
export const PreviewSuggestion = DescribeEvent<PreviewSuggestionProperties>(
  Events.PreviewSuggestion,
  PreviewSuggestionSchema,
  (props) =>
    `Suggestion to '${props.suggestion}' was previewed in response to diff: ${props.diff}`
);

const DiffWasResetSchema = Joi.object({});
type DiffWasResetProperties = Joi.extractType<typeof DiffWasResetSchema>;
export const DiffWasReset = DescribeEvent<DiffWasResetProperties>(
  Events.DiffWasReset,
  DiffWasResetSchema,
  (props) => `The Diff Was Reset`
);

const ChangesCommittedSchema = Joi.object({
  message: Joi.string().required(),
  captureId: Joi.string().required(),
  suggestions: Joi.number().required(),
});
type ChangesCommittedProperties = Joi.extractType<
  typeof ChangesCommittedSchema
>;
export const ChangesCommitted = DescribeEvent<ChangesCommittedProperties>(
  Events.ChangesCommitted,
  ChangesCommittedSchema,
  (props) => `The Diff Was Reset`
);
