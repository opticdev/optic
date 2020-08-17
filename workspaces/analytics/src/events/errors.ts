import { DescribeEvent, RegisteredEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';
// @ts-ignore
import * as Joi from '@hapi/joi';
import 'joi-extract-type';

const RequirementForDiffsToHaveASuggestionFailedSchema = Joi.object({
  diff: Joi.string().required(),
});
type RequirementForDiffsToHaveASuggestionFailedProperties = Joi.extractType<
  typeof RequirementForDiffsToHaveASuggestionFailedSchema
>;
export const RequirementForDiffsToHaveASuggestionFailed = DescribeEvent<
  RequirementForDiffsToHaveASuggestionFailedProperties
>(
  Events.RequirementForDiffsToHaveASuggestionFailed,
  RequirementForDiffsToHaveASuggestionFailedSchema,
  (props) => `Suggestions should never be empty for diff: ${props.diff}`
);

const JavascriptErrorDetectedInFrontendSchema = Joi.object({
  message: Joi.string().required(),
  stack: Joi.string().required(),
});
type JavascriptErrorDetectedInFrontendProperties = Joi.extractType<
  typeof JavascriptErrorDetectedInFrontendSchema
>;
export const JavascriptErrorDetectedInFrontend = DescribeEvent<
  JavascriptErrorDetectedInFrontendProperties
>(
  Events.JavascriptErrorDetectedInFrontend,
  JavascriptErrorDetectedInFrontendSchema,
  (props) => `Error on Frontend: ${props.message}`
);
