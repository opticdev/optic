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

  private browserStore: any[] = [];

  async launch(name: string) {
    if ((await this.browsersPromise).find((i) => i.name === name)) {
      // @ts-ignore
      launcher((err, launch) => {
        if (err) {
          return console.error(err);
        }

        launch(
          this.webUI,
          {
            browser: name,
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
            this.browserStore = [...this.browserStore, instance];
          }
        );
      });
    } else {
      this.cli.error(`Browser ${name} not found. Try another`);
    }
  }

  public async cleanup() {
    return Promise.all(
      this.browserStore.map(
        (i) =>
          new Promise((resolve, reject) => {
            i.stop(resolve);
          })
      )
    );
  }
  // options
  public async chrome() {
    await this.launch('chrome');
  }
  public async firefox() {
    await this.launch('firefox');
  }
}
