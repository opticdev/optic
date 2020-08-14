"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllEvents = exports.RegisterEvent = void 0;
function RegisterEvent(type, propsToSentence) {
    const event = {
        withProps(properties) {
            return {
                type: type,
                context: {
                    clientAgent: '',
                    clientId: '',
                    clientSessionInstanceId: '',
                    clientTimestamp: '',
                },
                data: properties,
            };
        },
        toSentence: (example) => {
            return propsToSentence(example.data);
        },
        eventName: type,
    };
    exports.AllEvents.push(event);
    return event;
}
exports.RegisterEvent = RegisterEvent;
exports.AllEvents = [];
