import launcher, { Browser } from '@httptoolkit/browser-launcher';
import Command from '@oclif/command';

export class BrowserLaunchers {
  private browsersPromise: Promise<Browser[]> = new Promise((resolve, reject) =>
    launcher.detect(resolve)
  );
  constructor(
    private proxy: string,
    private webUI: string,
    private fingerprint: string,
    private cli: Command
  ) {}

  private pidStore: string[] = [];

  async launch(name: string) {
    if ((await this.browsersPromise).find((i) => i.name === name)) {
      // @ts-ignore
      launcher((err, launch) => {
        if (err) {
          return console.error(err);
        }

        console.log(this.proxy);

        launch(
          this.webUI,
          {
            browser: name,
            detached: false,
            proxy: this.proxy,
            noProxy: ['<-loopback>', this.proxy],
            // profile: null,
            options: [
              // Trust our CA certificate's fingerprint:
              `--ignore-certificate-errors-spki-list=${this.fingerprint}`,
              // Avoid annoying extra network noise:
              '--disable-background-networking',
            ],
          },
          (err: any, instance: any) => {
            if (err) {
              return console.error(err);
            }
            this.pidStore = [...this.pidStore, instance.pid];
          }
        );
      });
    } else {
      this.cli.error(`Browser ${name} not found. Try another`);
    }
  }

  // options
  async chrome() {
    await this.launch('chrome');
  }
}
