import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';

export const DF = new DataFactory();

export interface IDatasetSummary {
  register: (quad: RDF.Quad) => void;
  toQuads: () => RDF.Quad[];
}

export interface IDatasetSummaryArgs {
  dataset: URL;
}

export abstract class DatasetSummary implements IDatasetSummary {
  protected readonly dataset: URL;

  public static readonly RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
  public static readonly RDF_TYPE = DF.namedNode(`${DatasetSummary.RDF_PREFIX}type`);
  public static readonly RDF_SUBJECT = DF.namedNode(`${DatasetSummary.RDF_PREFIX}subject`);
  public static readonly RDF_PREDICATE = DF.namedNode(`${DatasetSummary.RDF_PREFIX}predicate`);
  public static readonly RDF_OBJECT = DF.namedNode(`${DatasetSummary.RDF_PREFIX}object`);

  public static readonly XSD_INTEGER = DF.namedNode('http://www.w3.org/2001/XMLSchema#integer');

  public constructor(args: IDatasetSummaryArgs) {
    this.dataset = args.dataset;
  }

  public abstract register(quad: RDF.Quad): void;
  public abstract toQuads(): RDF.Quad[];
}
