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
      description: "Base specification.json file to compare from (e.g. main, master)",
      parse: (input: string) => {
        return fs.readJSONSync(input);
      }
    },
    {
      name: "head",
      required: true,
      description: "Head specification.json file to compare with (e.g. feature, fix)",
      parse: (input: string) => {
        return fs.readJSONSync(input);
      }
    },
  ];

  static flags = {
    specUrl: flags.string({
      name: "specUrl",
      description: "the url where the head specification is located (use ci publish)",
      required: false
    })
  }
  async run() {
    const { args, flags } = this.parse(Compare);
    const { base, head } = args;
    const { specUrl } = flags;
    
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
      this.log(`**No changes detected!**`)
    } else {
      table.push(...changes);
      this.log(`Optic detected **${changes.length} changes** to your API's behavior.`)
      this.log(table.join("\n"));
    }
    this.log("#### Powered by Optic");
  }
}