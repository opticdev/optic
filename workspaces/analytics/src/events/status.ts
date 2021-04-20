import { DescribeEvent, RegisteredEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';
import * as Joi from 'joi';
import 'joi-extract-type';

const StatusRunSchema = Joi.object({
  captureId: Joi.string().required(),
  undocumentedCount: Joi.number(),
  diffCount: Joi.number(),
  timeMs: Joi.number()
});
// @ts-ignore
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
