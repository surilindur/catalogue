import type * as RDF from '@rdfjs/types';
import { DataSerializer } from './DataSerializer';

export class DataSerializerConsole extends DataSerializer {
  public async serialize(pods: URL, stream: RDF.Stream): Promise<URL[]> {
    return new Promise((resolve, reject) => {
      const targets: Set<URL> = new Set();
      stream.on('data', (quad: RDF.Quad) => {
        const outputUri = this.subjectToOutputUri(pods, quad.subject);
        console.log(outputUri);
        if (outputUri) {
          targets.add(outputUri);
          // eslint-disable-next-line no-console
          console.log(outputUri, quad);
        }
      }).on('end', () => resolve([ ...targets ])).on('error', reject);
    });
  }
}
