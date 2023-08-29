import type * as RDF from '@rdfjs/types';
import type { DatasetSummary } from './DatasetSummary';

export abstract class SummaryCollector<T extends DatasetSummary> implements ISummaryCollector {
  protected readonly datasetUriRegex: RegExp;
  protected readonly datasetSummariesByDataset: Map<string, T>;

  public constructor(args: ISummaryCollectorArgs) {
    this.datasetUriRegex = new RegExp(args.datasetUriRegex, 'u');
    this.datasetSummariesByDataset = new Map();
  }

  public add(quads: RDF.Quad[]): RDF.Quad[] {
    for (const quad of quads) {
      const dataset = this.getDatasetForQuad(quad);
      if (dataset) {
        this.getSummary(dataset).register(quad);
      }
    }
    const summaryQuads: RDF.Quad[] = [];
    for (const summary of this.datasetSummariesByDataset.values()) {
      summaryQuads.push(...summary.quads());
    }
    return summaryQuads;
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
  add: (quads: RDF.Quad[]) => RDF.Quad[];
}

export interface ISummaryCollectorArgs {
  /**
   * Regular expression for extracting the dataset URI from subjects.
   * The summaries will be generated per extracted dataset URI.
   */
  datasetUriRegex: string;
}
