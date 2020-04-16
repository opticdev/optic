"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const Analytics = require("analytics-node");
const authentication_1 = require("@useoptic/cli-server/build/authentication");
const analytics = new Analytics('RvYGmY1bZqlbMukS8pP9DPEifG6CEBEs', { flushAt: 1 });
const getUserPromise = authentication_1.getUser();
getUserPromise.then((user) => {
    if (user) {
        analytics.identify({ userId: user.sub, traits: { name: user.name, email: user.email } });
    }
});
async function track(event, properties = {}) {
    await new Promise(((resolve, reject) => {
        getUserPromise.then(user => {
            if (user) {
                analytics.track({ userId: user.sub, event, properties }, resolve);
            }
            else {
                analytics.track({ anonymousId: 'anon', event, properties }, resolve);
            }
        });
    }));
}
exports.track = track;
