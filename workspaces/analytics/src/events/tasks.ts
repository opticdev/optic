import { DescribeEvent, RegisteredEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';
import * as Joi from 'joi';
import 'joi-extract-type';

// Sent whenever an API is created
const StartedTaskWithLocalCliSchema = Joi.object({
  captureId: Joi.string().required(),
  cwd: Joi.string().required(),
  inputs: Joi.object().unknown(true),
});
// @ts-ignore
type StartedTaskWithLocalCliProperties = Joi.extractType<
  typeof StartedTaskWithLocalCliSchema
>;
export const StartedTaskWithLocalCli = DescribeEvent<
  StartedTaskWithLocalCliProperties
>(
  Events.StartedTaskWithLocalCli,
  StartedTaskWithLocalCliSchema,
  (props) => `User ran task`
);

const ExitedTaskWithLocalCliSchema = Joi.object({
  captureId: Joi.string().required(),
  interactionCount: Joi.number().required(),
  inputs: Joi.object().unknown(true),
});
// @ts-ignore
type ExitedTaskWithLocalCliProperties = Joi.extractType<
  typeof ExitedTaskWithLocalCliSchema
>;
export const ExitedTaskWithLocalCli = DescribeEvent<
  ExitedTaskWithLocalCliProperties
>(
  Events.ExitedTaskWithLocalCli,
  ExitedTaskWithLocalCliSchema,
  (props) => `User ran task`
);

const LiveTrafficIngestedCliSchema = Joi.object({
  captureId: Joi.string().required(),
  interactionCount: Joi.number().required()
});
// @ts-ignore
type LiveTrafficIngestedCliProperties = Joi.extractType<
  typeof LiveTrafficIngestedCliSchema
>;
export const LiveTrafficIngestedWithLocalCli = DescribeEvent<
  LiveTrafficIngestedCliProperties
>(
  Events.LiveTrafficIngestedWithLocalCli,
  LiveTrafficIngestedCliSchema,
  (props) => `User ingested live traffic`
);
