import * as Joi from '@hapi/joi';
import { DescribeEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';

const WildcardSchema = Joi.any();

/* we need a better approach for defining new events. It's high to do them here and then release to get them to the saas webapp repo. This should work in the short term so I can give Lou a few extras events he needs today to help on-board */

export function wildcardEvent(type: string, props: any) {
  const WildcardEvent = DescribeEvent<any>(
    type,
    WildcardSchema,
    (props: any) => `${type} with ${JSON.stringify(props)}`
  );

  return WildcardEvent.withProps(props);
}
