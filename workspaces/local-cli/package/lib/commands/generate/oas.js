"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const cli_config_1 = require("@useoptic/cli-config");
const domain_1 = require("@useoptic/domain");
const cli_ux_1 = require("cli-ux");
const fs = require("fs-extra");
const path = require("path");
const yaml = require("js-yaml");
const conversation_1 = require("../../shared/conversation");
class GenerateOas extends command_1.default {
    async run() {
        try {
            const paths = await cli_config_1.getPathsRelativeToConfig();
            const { specStorePath } = paths;
            try {
                const eventsBuffer = await fs.readFile(specStorePath);
                const eventsString = eventsBuffer.toString();
                cli_ux_1.cli.action.start('Generating OAS file');
                const parsedOas = domain_1.OasProjectionHelper.fromEventString(eventsString);
                const outputFile = await this.emit(paths, parsedOas);
                cli_ux_1.cli.action.stop('\n' + conversation_1.fromOptic('Generated OAS file at ' + outputFile));
            }
            catch (e) {
                this.error(e);
            }
        }
        catch (e) {
            this.error(e);
        }
    }
    async emit(paths, parsedOas) {
        const { flags } = this.parse(GenerateOas);
        const shouldOutputYaml = flags.yaml;
        const outputPath = path.join(paths.basePath, 'generated');
        await fs.ensureDir(outputPath);
        if (shouldOutputYaml) {
            const outputFile = path.join(outputPath, 'openapi.yaml');
            await fs.writeFile(outputFile, yaml.safeDump(parsedOas, { indent: 1 }));
            return outputFile;
        }
        else {
            const outputFile = path.join(outputPath, 'openapi.json');
            await fs.writeJson(outputFile, parsedOas, { spaces: 2 });
            return outputFile;
        }
    }
}
exports.default = GenerateOas;
GenerateOas.description = 'export an OpenAPI 3.0.1 spec';
GenerateOas.flags = {
    json: command_1.flags.boolean({
        default: true,
        exclusive: ['yaml']
    }),
    yaml: command_1.flags.boolean({
        exclusive: ['json']
    }),
};
