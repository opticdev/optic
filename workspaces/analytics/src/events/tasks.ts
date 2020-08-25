import { DescribeEvent, RegisteredEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';
// @ts-ignore
import * as Joi from '@hapi/joi';
import 'joi-extract-type';

// Sent whenever an API is created
const StartedTaskWithLocalCLISchema = Joi.object({
  captureId: Joi.string().required(),
  cwd: Joi.string().required(),
  inputs: Joi.object().unknown(true),
});
type StartedTaskWithLocalCLIProperties = Joi.extractType<
  typeof StartedTaskWithLocalCLISchema
>;
export const StartedTaskWithLocalCLI = DescribeEvent<
  StartedTaskWithLocalCLIProperties
>(
  Events.StartedTaskWithLocalCLI,
  StartedTaskWithLocalCLISchema,
  (props) => `User ran task`
);

const ExitedTaskWithLocalCLISchema = Joi.object({
  captureId: Joi.string().required(),
  interactionCount: Joi.number().required(),
  inputs: Joi.object().unknown(true),
});
type ExitedTaskWithLocalCLIProperties = Joi.extractType<
  typeof ExitedTaskWithLocalCLISchema
>;
export const ExitedTaskWithLocalCLI = DescribeEvent<
  ExitedTaskWithLocalCLIProperties
>(
  Events.ExitedTaskWithLocalCLI,
  ExitedTaskWithLocalCLISchema,
  (props) => `User ran task`
);
