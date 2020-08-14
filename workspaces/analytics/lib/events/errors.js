"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegisterEvent_1 = require("../interfaces/RegisterEvent");
const Events_1 = require("../interfaces/Events");
// When JS issues are observed on the frontend
module.exports[Events_1.Events.JavascriptErrorDetectedInFrontend] = RegisterEvent_1.RegisterEvent(Events_1.Events.JavascriptErrorDetectedInFrontend, (data) => `A JS error ${data.message} observed in frontend`);
