"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
const tslib_1 = require("tslib");
//@ts-ignore
const keymirror = tslib_1.__importStar(require("keymirror"));
exports.Events = keymirror({
    ApiCreated: null,
    //Errors
    JavascriptErrorDetectedInFrontend: null,
});
