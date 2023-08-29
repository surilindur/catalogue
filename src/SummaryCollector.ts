import type * as RDF from '@rdfjs/types';
import type { DatasetSummary } from './DatasetSummary';

export abstract class SummaryCollector<T extends DatasetSummary> implements ISummaryCollector {
  protected readonly datasetUriRegex: RegExp;
  protected readonly datasetSummariesByDataset: Map<string, T>;

  public constructor(args: ISummaryCollectorArgs) {
    this.datasetUriRegex = new RegExp(args.datasetUriRegex, 'u');
    this.datasetSummariesByDataset = new Map();
  }

  public load(stream: RDF.Stream): Promise<RDF.Quad[]> {
    return new Promise((resolve, reject) => {
      stream
        .on('data', quad => {
          const dataset = this.getDatasetForQuad(quad);
          if (dataset) {
            this.getSummary(dataset).register(quad);
          }
        })
        .on('end', () => {
          const summaryQuads: RDF.Quad[] = [];
          for (const summary of this.datasetSummariesByDataset.values()) {
            summaryQuads.push(...summary.quads());
          }
          resolve(summaryQuads);
        })
        .on('error', reject);
    });
  }

  protected abstract getSummary(dataset: string): T;

  protected getDatasetForQuad(quad: RDF.Quad): string | undefined {
    if (quad.subject.termType === 'NamedNode') {
      const match = this.datasetUriRegex.exec(quad.subject.value);
      if (match && match.length > 1) {
        return match[1];
      }
    }
  }
}

export interface ISummaryCollector {
  load: (stream: RDF.Stream) => Promise<RDF.Quad[]>;
}

export interface ISummaryCollectorArgs {
  /**
   * Regular expression for extracting the dataset URI from subjects.
   * The summaries will be generated per extracted dataset URI.
   */
  datasetUriRegex: string;
}
