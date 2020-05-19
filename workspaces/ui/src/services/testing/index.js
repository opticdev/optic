"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var TESTING_SERVICE_ERROR_TYPE = Symbol('testing-service-error');
var TestingServiceError = /** @class */ (function (_super) {
    __extends(TestingServiceError, _super);
    function TestingServiceError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = TESTING_SERVICE_ERROR_TYPE;
        return _this;
    }
    TestingServiceError.instanceOf = function (maybeErr) {
        return maybeErr && maybeErr.type === TESTING_SERVICE_ERROR_TYPE;
    };
    TestingServiceError.prototype.notFound = function () {
        return this.statusCode === 404;
    };
    return TestingServiceError;
}(Error));
exports.TestingServiceError = TestingServiceError;
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.statusCode = 404;
        return _this;
    }
    return NotFoundError;
}(TestingServiceError));
exports.NotFoundError = NotFoundError;
var Ok = /** @class */ (function () {
    function Ok(value) {
        this.value = value;
    }
    Ok.prototype.isOk = function () {
        return true;
    };
    Ok.prototype.isErr = function () {
        return !this.isOk();
    };
    Ok.prototype.unwrap = function () {
        return this.value;
    };
    Ok.prototype.unwrapErr = function () {
        throw new Error('Cannot unwrap error on Ok');
    };
    return Ok;
}());
exports.Ok = Ok;
var Err = /** @class */ (function () {
    function Err(error) {
        this.error = error;
    }
    Err.prototype.isOk = function () {
        return !this.isErr();
    };
    Err.prototype.isErr = function () {
        return true;
    };
    Err.prototype.unwrap = function () {
        throw this.error;
    };
    Err.prototype.unwrapErr = function () {
        return this.error;
    };
    return Err;
}());
exports.Err = Err;
function ok(value) {
    return new Ok(value);
}
exports.ok = ok;
function err(err) {
    return new Err(err);
}
exports.err = err;
