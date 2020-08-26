import { Command, flags } from '@oclif/command';
import { ChangeLogFacade } from '@useoptic/domain';
import fs from 'fs-extra';

export class Compare extends Command {
  static description =
    'compares two specification files to determine the changes';

  static examples = [`$ optic-ci compare`];

  static args = [
    {
      name: "base",
      required: true,
      description: "Base specification.json file to compare from (e.g. main, master). Defaults to empty",
      parse: (input: string) => {
        if (fs.existsSync(input)) {
          return fs.readJSONSync(input);
        } else {
          return [];
        }
      }
    },
    {
      name: "head",
      required: true,
      description: "Head specification.json file to compare with (e.g. feature, fix). Defaults to empty",
      parse: (input: string) => {
        if (fs.existsSync(input)) {
          return fs.readJSONSync(input);
        } else {
          return [];
        }
      }
    },
  ];

  static flags = {
    specUrl: flags.string({
      name: "specUrl",
      description: "the url where the head specification is located (use ci publish)",
      required: false
    }),
    escape: flags.boolean({
      name: "escape",
      description: "condense all output to be in one line (ideal for bash exporting)",
      required: false
    })
  }

  escapeMode: boolean = false;
  outputString: string = "";

  output(message: any = "") {
    if (this.escapeMode) {
      this.outputString += message + "\n";
    } else {
      this.log(message);
    }
  }

  async run() {
    const { args, flags } = this.parse(Compare);
    const { base, head } = args;
    const { specUrl, escape } = flags;
    this.escapeMode = escape;
    const changelogArray = ChangeLogFacade.from(base, head);
    const table = ["| Endpoint   |      Name      |  Status |", "|----------|:-------------:|------:|"];

    const link = (text: string, href: string) => {
      if (!specUrl) {
        return text;
      }
      return `[${text}](${specUrl}/${href})`;
    }

    const changes = (changelogArray.filter((change: any) => change.updated || change.added || change.removed).map((change: any) : string => {
      const status = change.updated ? "updated" : change.added ? "added" : "removed";
      const url = `documentation/paths/${change.pathId}/methods/${change.method}`;
      return `| ${link(`${change.method} ${change.absolutePath}`, url)} |  ${link(change.endpointName, url)} | ${link(status, url)} |`;
    }));

    if (changes.length === 0) {
      this.output(`**No changes detected!**`)
    } else {
      table.push(...changes);
      this.output(`Optic detected **${changes.length} ${changes.length > 1 ? "changes" : "change"}** to your API's behavior.`)
      this.output(table.join("\n"));
    }
    this.output();
    this.output(`See full specification @ ${specUrl}`)
    this.output("#### Powered by Optic");

    if (this.escapeMode) {
      this.log(JSON.stringify(this.outputString))
    }
  }
}