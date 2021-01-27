import { DescribeEvent, RegisteredEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';
// @ts-ignore
import * as Joi from '@hapi/joi';
import 'joi-extract-type';

const StatusRunSchema = Joi.object({
  captureId: Joi.string().required(),
  undocumentedCount: Joi.number(),
  diffCount: Joi.number(),
  timeMs: Joi.number()
});
type StatusRunProperties = Joi.extractType<
  typeof StatusRunSchema
>;
export const StatusRun = DescribeEvent<
  StatusRunProperties
>(
  Events.StatusRunLocalCLI,
  StatusRunSchema,
  (props) => `User ran status`
);
