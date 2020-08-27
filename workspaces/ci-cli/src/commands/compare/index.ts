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
    const changelogArray: any[] = ChangeLogFacade.from(base, head);
    const tableHeader = ["| Endpoint   |      Name      |  Status |", "|----------|-------------|------:|"];

    const link = (text: string, href: string) => {
      return `[${text}](${href})`;
    }

    const docLink = (text: string, href: string) => {
      if (!specUrl) {
        return link(text, href);
      }
      return link(text, `${specUrl}/${href}`)
    }

    const changeToString = (change: any) => {
      const status = change.updated ? "updated" : change.added ? "added" : "removed";
      change.method = change.method.toUpperCase();
      const url = `documentation/paths/${change.pathId}/methods/${change.method}`;
      return `| ${`**${change.method}** ${change.absolutePath}`} |  ${change.endpointName} | ${docLink(status, url)} |`;
    }

    const addedChanges = changelogArray.filter((change: any) => change.added).map(changeToString);
    addedChanges.unshift(...addedChanges.length > 0 ? tableHeader : [])
    addedChanges.unshift(...(addedChanges.length > 0 ? ["## Added Endpoints"] : []));

    const updatedChanges = changelogArray.filter((change: any) => change.updated).map(changeToString);
    updatedChanges.unshift(...updatedChanges.length > 0 ? tableHeader : [])
    updatedChanges.unshift(...(updatedChanges.length > 0 ? ["## Updated Endpoints"] : []));

    const removedChanges = changelogArray.filter((change: any) => change.removed).map(changeToString);
    removedChanges.unshift(...removedChanges.length > 0 ? tableHeader : [])
    removedChanges.unshift(...(removedChanges.length > 0 ? ["## Removed Endpoints"] : []));

    const totalChanges = addedChanges.length + updatedChanges.length + removedChanges.length;

    
    if (totalChanges === 0) {
      this.output(`**No changes detected!**`);
      this.output(`See full specification @ ${specUrl}`);
    } else {
      this.output(`### Optic detected **${totalChanges} ${totalChanges > 1 ? "changes" : "change"}** to your API's behavior.`);
      this.output(`See full specification @ ${specUrl}`);
      this.output(addedChanges.join("\n"));
      this.output(updatedChanges.join("\n"));
      this.output(removedChanges.join("\n"));
    }
    this.output();
    this.output(`### Powered by ${link("Optic", "https://useoptic.com")}`);
    this.output(`<!-- OPTIC_BOT_ID_REFERENCE: THIS LINE IS USED TO IDENTIFY THE COMMENT TO EDIT IT -->`)
    
    if (this.escapeMode) {
      const escapedString = JSON.stringify(this.outputString);
      this.log(escapedString.substring(1, escapedString.length - 1));
    }
  }
}