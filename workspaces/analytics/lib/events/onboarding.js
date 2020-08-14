"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegisterEvent_1 = require("../interfaces/RegisterEvent");
const Events_1 = require("../interfaces/Events");
// Sent when an API is created by a user
module.exports[Events_1.Events.ApiCreated] = RegisterEvent_1.RegisterEvent(Events_1.Events.ApiCreated, (data) => `An API called ${data.apiName} was created`);
