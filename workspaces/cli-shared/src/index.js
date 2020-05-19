"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bottleneck_1 = require("bottleneck");
var fs = require("fs-extra");
var path = require("path");
var avro = require("avsc");
var uuid = require("uuid");
exports.schema = require('@useoptic/domain/build/domain-types/avro-schemas/capture.json');
exports.serdes = avro.Type.forSchema(exports.schema);
exports.captureFileSuffix = '.optic-capture.avro';
var shouldDumpRaw = process.env.OPTIC_ENABLE_DUMP === 'yes';
var FileSystemCaptureSaver = /** @class */ (function () {
    function FileSystemCaptureSaver(config) {
        this.config = config;
        this.batcher = new bottleneck_1.default.Batcher({
            maxSize: 100,
            maxTime: 1000,
        });
        this.batchCount = 0;
    }
    FileSystemCaptureSaver.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var captureId, outputDirectory, agentId, agentGroupId;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        captureId = this.config.captureId;
                        outputDirectory = path.join(this.config.captureBaseDirectory, captureId);
                        return [4 /*yield*/, fs.ensureDir(outputDirectory)];
                    case 1:
                        _a.sent();
                        agentId = uuid.v4();
                        agentGroupId = 'ddoshi-test-service';
                        this.batcher.on('batch', function (items) { return __awaiter(_this, void 0, void 0, function () {
                            var outputFile, batchId, output, encoder_1, e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        userDebugLogger("writing batch " + this.batchCount);
                                        outputFile = path.join(outputDirectory, "" + this.batchCount + exports.captureFileSuffix);
                                        batchId = this.batchCount.toString();
                                        this.batchCount += 1;
                                        output = {
                                            groupingIdentifiers: {
                                                agentGroupId: agentGroupId,
                                                agentId: agentId,
                                                batchId: batchId,
                                                captureId: captureId,
                                            },
                                            batchItems: items,
                                        };
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 4, , 5]);
                                        encoder_1 = avro.createFileEncoder(outputFile, exports.schema);
                                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                encoder_1.write(output, function (err) {
                                                    if (err) {
                                                        return reject(err);
                                                    }
                                                    resolve();
                                                });
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                encoder_1.end(function () {
                                                    resolve();
                                                });
                                            })];
                                    case 3:
                                        _a.sent();
                                        userDebugLogger("wrote batch " + this.batchCount);
                                        this.batchCount += 1;
                                        return [3 /*break*/, 5];
                                    case 4:
                                        e_1 = _a.sent();
                                        console.error(e_1);
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    FileSystemCaptureSaver.prototype.save = function (sample) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // don't await flush, just enqueue
                this.batcher.add(sample);
                return [2 /*return*/];
            });
        });
    };
    FileSystemCaptureSaver.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    return FileSystemCaptureSaver;
}());
exports.FileSystemCaptureSaver = FileSystemCaptureSaver;
