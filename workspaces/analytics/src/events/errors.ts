import { DescribeEvent, RegisteredEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';
import * as Joi from 'joi';
import 'joi-extract-type';

const RequirementForDiffsToHaveASuggestionFailedSchema = Joi.object({
  diff: Joi.string().required(),
});
// @ts-ignore
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
// @ts-ignore
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
