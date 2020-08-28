import { DescribeEvent, RegisteredEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';
// @ts-ignore
import * as Joi from '@hapi/joi';
import 'joi-extract-type';
import { CheckAssertionsResult } from '../interfaces/ApiCheck';

// Sent whenever an API is created
const ApiCreatedSchema = Joi.object({ apiName: Joi.string().required() });

type ApiCreatedProperties = Joi.extractType<typeof ApiCreatedSchema>;
export const ApiCreated = DescribeEvent<ApiCreatedProperties>(
  Events.ApiCreated,
  ApiCreatedSchema,
  (props) => `An API called ${props.apiName} was created`
);

const ApiInitializedInProjectSchema = Joi.object({
  apiName: Joi.string().required(),
  cwd: Joi.string().required(),
});

type ApiInitializedInProjectProperties = Joi.extractType<
  typeof ApiInitializedInProjectSchema
>;
export const ApiInitializedInProject = DescribeEvent<
  ApiInitializedInProjectProperties
>(
  Events.ApiInitializedInProject,
  ApiInitializedInProjectSchema,
  (props) => `An API called ${props.apiName} was initialized in ${props.cwd}`
);

const ApiCheckCompletedSchema = Joi.any();
export const ApiCheckCompleted = DescribeEvent<CheckAssertionsResult>(
  Events.ApiCheckCompleted,
  ApiCheckCompletedSchema,
  (props) =>
    `API Check for ${props.mode} task: ${props.taskName} ${
      props.passed ? 'passed' : 'failed'
    } `
);
