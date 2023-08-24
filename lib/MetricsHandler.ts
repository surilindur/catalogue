import type { HttpHandlerInput, Logger } from '@solid/community-server';
import { HttpHandler, getLoggerFor } from '@solid/community-server';

/**
 * Handler that attempts to collect metrics around HTTP requests to the server,
 * and to make those metrics available at a configurable URL.
 */
export class MetricsHandler extends HttpHandler {
  private readonly endpoint: string;
  private readonly logger: Logger = getLoggerFor(this);

  private totalRequests: number;
  private previousInput: HttpHandlerInput | undefined;

  /**
   * Creates a handler that attempts to collect metrics around HTTP requests.
   */
  public constructor(args: IMetricsHandlerArgs) {
    super();
    this.totalRequests = 0;
    this.endpoint = args.endpoint;
  }

  public async canHandle(input: HttpHandlerInput): Promise<void> {
    if (input !== this.previousInput && input.request.url !== this.endpoint) {
      this.totalRequests++;
      this.previousInput = input;
    }
    if (input.request.method !== 'GET') {
      throw new Error(`${this.constructor.name} can only handle GET requests`);
    } else if (input.request.url !== this.endpoint) {
      throw new Error(`${this.constructor.name} can only handle requests at ${this.endpoint}`);
    }
  }

  public async handle(input: HttpHandlerInput): Promise<void> {
    this.logger.debug(`Serving metrics to ${input.request.url}`);
    return new Promise((resolve, reject): void => {
      input.response.writeHead(200, { 'content-type': 'application/json' });
      const metricsResponse = JSON.stringify({
        requests: this.totalRequests,
      });
      const responseCallback = (error: Error | null | undefined): void => {
        input.response.end();
        if (error) {
          reject(error);
        }
        resolve();
      };
      if (!input.response.write(metricsResponse, responseCallback)) {
        input.response.once('drain', responseCallback);
      } else {
        process.nextTick(responseCallback);
      }
    });
  }
}

export interface IMetricsHandlerArgs {
  /**
   * The URL to expose the collected metrics at
   * @default{'/metrics'}
   */
  endpoint: string;
  /**
   * Additional options
   */
  options?: Record<string, any>;
}
