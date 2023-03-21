import url from 'url';
import { createCommandFeedback } from '../commands/reporters/feedback';
import { platform, runCommand } from '../shell-utils';
import { parseMacNetworkLine } from './mac-system-proxy';

export class SystemProxy {
  constructor(
    private proxyUrl: string,
    private feedback: ReturnType<typeof createCommandFeedback>
  ) {}
  private stopCommand: (() => Promise<void>) | undefined = undefined;

  async start(device: string | undefined) {
    const { port } = url.parse(this.proxyUrl);

    if (platform === 'mac') {
      const name = await chooseInterfaceMac();

      const previousState = await Promise.all([
        runCommand(`networksetup -getwebproxy "${name}"`).then(
          parseMacNetworkLine
        ),
        runCommand(`networksetup -getsecurewebproxy "${name}"`).then(
          parseMacNetworkLine
        ),
        runCommand(`networksetup -getproxybypassdomains "${name}"`).then(
          (result) => result.trim()
        ),
      ]);

      if (previousState[0].enabled || previousState[1].enabled) {
        this.feedback.notable(
          `Your computer already has a system proxy configured. Optic will not overwrite those settings. `
        );
        this.feedback.notable(
          `The Optic proxy is on ${this.proxyUrl}. Route traffic through that proxy to record it`
        );

        this.stopCommand = async () => {};

        return;
      }

      await Promise.all([
        runCommand(`networksetup -setwebproxy "${name}" 127.0.0.1 ${port}`),
        runCommand(
          `networksetup -setsecurewebproxy "${name}" 127.0.0.1 ${port}`
        ),
        runCommand(
          `networksetup -setproxybypassdomains "${name}" "<-loopback>"`
        ),
      ]);

      this.feedback.notable(`Proxy running on ${this.proxyUrl}.`);

      this.stopCommand = async () => {
        await Promise.all([
          runCommand(`networksetup -setwebproxystate "${name}" off`),
          runCommand(`networksetup -setsecurewebproxystate "${name}" off`),
        ]);
        this.feedback.notable(`System Proxy settings restored`);
      };
    } else {
      this.feedback.notable(
        `Proxy running on ${this.proxyUrl}. System proxy updated`
      );
      console.log(
        `automatic proxy configuration is not supported on ${platform}`
      );
    }
  }
  async stop() {
    if (this.stopCommand) await this.stopCommand();
  }
}

export async function chooseInterfaceMac() {
  const network = await runCommand('scutil --nwi');
  const device = new RegExp(/Network interfaces: (en[0-9])/);

  const result = network.match(device);

  let devicePreference = result ? result[1] : 'en0';

  const hardware = await runCommand('networksetup -listallhardwareports');
  const regex = new RegExp(/(Hardware Port: (.*)\nDevice: (.*)\n)/);

  let name: string | undefined = undefined;
  hardware.split(/\n\s*\n/).forEach((entry) => {
    if (name) return;
    const match = regex.exec(entry);

    if (match && match[3] === devicePreference) {
      name = match[2];
    }
  });
  return name || 'Wi-Fi';
}
