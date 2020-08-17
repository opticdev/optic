import { DescribeEvent, RegisteredEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';
// @ts-ignore
import * as Joi from '@hapi/joi';
import 'joi-extract-type';

// Sent whenever an API is created
const ApiCreatedSchema = Joi.object({ apiName: Joi.string().required() });
type ApiCreatedProperties = Joi.extractType<typeof ApiCreatedSchema>;
export const ApiCreated = DescribeEvent<ApiCreatedProperties>(
  Events.ApiCreated,
  ApiCreatedSchema,
  (props) => `An API called ${props.apiName} was created`
);

const ApiCheckCompletedSchema = Joi.object({
  hasError: Joi.boolean().required(),
  error: Joi.string().optional(),
  inputs: Joi.object().unknown(true),
});
type ApiCheckCompletedProperties = Joi.extractType<
  typeof ApiCheckCompletedSchema
>;
export const ApiCheckCompleted = DescribeEvent<ApiCheckCompletedProperties>(
  Events.ApiCheckCompleted,
  ApiCheckCompletedSchema,
  (props) => `API Check ${props.hasError ? 'failed' : 'succeeded'} `
);
