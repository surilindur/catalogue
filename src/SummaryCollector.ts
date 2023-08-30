import type * as RDF from '@rdfjs/types';
import type { DatasetSummary } from './DatasetSummary';

export abstract class SummaryCollector<T extends DatasetSummary> implements ISummaryCollector {
  protected readonly datasetSummariesByDataset: Map<string, T>;

  public constructor(args: ISummaryCollectorArgs) {
    this.datasetSummariesByDataset = new Map();
  }

  public register(datasetQuads: Map<string, RDF.Quad[]>): Map<string, RDF.Quad[]> {
    for (const [ dataset, quads ] of datasetQuads) {
      const summary = this.getSummary(dataset);
      for (const quad of quads) {
        summary.register(quad);
      }
    }
    const summaryQuads: Map<string, RDF.Quad[]> = new Map();
    for (const [ dataset, summary ] of this.datasetSummariesByDataset) {
      summaryQuads.set(dataset, summary.quads());
    }
    return summaryQuads;
  }

  protected abstract getSummary(dataset: string): T;
}

export interface ISummaryCollector {
  register: (groupedQuads: Map<string, RDF.Quad[]>) => Map<string, RDF.Quad[]>;
}

export interface ISummaryCollectorArgs {}
