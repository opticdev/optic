import { RegisterEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';

// Sent when an API is created by a user
module.exports[Events.ApiCreated] = RegisterEvent<ApiCreatedProperties>(
  Events.ApiCreated,
  (data: ApiCreatedProperties) => `An API called ${data.apiName} was created`
);
export interface ApiCreatedProperties {
  apiName: string;
}
