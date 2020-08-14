import { RegisterEvent } from '../interfaces/RegisterEvent';
import { Events } from '../interfaces/Events';

// When JS issues are observed on the frontend
module.exports[Events.JavascriptErrorDetectedInFrontend] = RegisterEvent<
  JavascriptErrorDetectedInFrontendProperties
>(
  Events.JavascriptErrorDetectedInFrontend,
  (data: JavascriptErrorDetectedInFrontendProperties) =>
    `A JS error ${data.message} observed in frontend`
);
export interface JavascriptErrorDetectedInFrontendProperties {
  message: string;
  stack: string;
}
