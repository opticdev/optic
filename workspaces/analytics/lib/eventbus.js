"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newAnalyticsEventBus = void 0;
const events_1 = require("events");
function newAnalyticsEventBus(getContext) {
    const eventEmitter = new events_1.EventEmitter();
    return {
        emit: (event) => {
            eventEmitter.emit('event', Object.assign(Object.assign({}, event), { context: getContext() }));
        },
        listen: (callback) => {
            eventEmitter.on('event', callback);
        },
    };
}
exports.newAnalyticsEventBus = newAnalyticsEventBus;
