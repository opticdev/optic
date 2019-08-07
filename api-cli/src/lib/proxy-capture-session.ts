import { EventEmitter } from 'events';
import { IApiInteraction } from './common';
import { ProxyServer } from './proxy-server';

export interface IProxyCaptureSessionConfig {
    port: number
    target: string
}
export interface ICaptureSessionResult {
    session: {
        start: Date
        end: Date
    }
    samples: IApiInteraction[]
}

class ProxyCaptureSession {
    private readonly proxy = new ProxyServer();
    private readonly samples: IApiInteraction[] = [];
    public events: EventEmitter = new EventEmitter();

    public start(config: IProxyCaptureSessionConfig) {

        this.proxy.on('sample', this.handleSample);

        return this.proxy
            .start({
                proxyPort: config.port,
                target: config.target,
            });
    }

    public stop() {
        this.proxy.stop();
    }

    public getSamples() {
        return this.samples;
    }

    private handleSample = (sample: IApiInteraction) => {
        this.events.emit('sample', sample);
        this.samples.push(sample);
    };
}

export {
    ProxyCaptureSession,
};
