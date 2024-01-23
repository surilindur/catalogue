import type * as RDF from '@rdfjs/types';
import { Bloem } from 'bloem';
import { DF, DatasetSummary, type IDatasetSummaryArgs } from './DatasetSummary';

export class DatasetSummaryBloom extends DatasetSummary {
  protected readonly filterSize: number;
  protected readonly filterSlices: number;

  protected readonly filter: Bloem;
  protected readonly filterForSubject: Bloem;
  protected readonly filterForPredicate: Bloem;
  protected readonly filterForObject: Bloem;

  public static readonly MEM_PREFIX = 'http://semweb.mmlab.be/ns/membership#';
  public static readonly MEM_BLOOMFILTER = DF.namedNode(`${DatasetSummaryBloom.MEM_PREFIX}BloomFilter`);
  public static readonly MEM_COLLECTION = DF.namedNode(`${DatasetSummaryBloom.MEM_PREFIX}sourceCollection`);
  public static readonly MEM_REPRESENTATION = DF.namedNode(`${DatasetSummaryBloom.MEM_PREFIX}binaryRepresentation`);
  public static readonly MEM_BITSIZE = DF.namedNode(`${DatasetSummaryBloom.MEM_PREFIX}bitSize`);
  public static readonly MEM_HASHSIZE = DF.namedNode(`${DatasetSummaryBloom.MEM_PREFIX}hashSize`);
  public static readonly MEM_PROPERTY = DF.namedNode(`${DatasetSummaryBloom.MEM_PREFIX}projectedProperty`);

  public constructor(args: IDatasetSummaryBloomArgs) {
    super(args);
    this.filterSize = args.filterSize ?? 32;
    this.filterSlices = args.filterSlices ?? 4;
    const bits = this.filterSize / 8;
    this.filter = new Bloem(this.filterSize, this.filterSlices, Buffer.alloc(bits));
    this.filterForSubject = new Bloem(this.filterSize, this.filterSlices, Buffer.alloc(bits));
    this.filterForPredicate = new Bloem(this.filterSize, this.filterSlices, Buffer.alloc(bits));
    this.filterForObject = new Bloem(this.filterSize, this.filterSlices, Buffer.alloc(bits));
  }

  public register(quad: RDF.Quad): void {
    if (quad.subject.termType === 'NamedNode') {
      const buffer = Buffer.from(quad.subject.value);
      this.filter.add(buffer);
      this.filterForSubject?.add(buffer);
    }
    if (quad.predicate.termType === 'NamedNode') {
      const buffer = Buffer.from(quad.predicate.value);
      this.filter.add(buffer);
      this.filterForPredicate?.add(buffer);
    }
    if (quad.object.termType === 'NamedNode' || quad.object.termType === 'Literal') {
      const buffer = Buffer.from(quad.object.value);
      this.filter.add(buffer);
      this.filterForObject?.add(buffer);
    }
  }

  public toQuads(): RDF.Quad[] {
    const result: RDF.Quad[] = [];
    const filtersToSerialize: Record<string, [ Bloem, RDF.NamedNode[] ]> = {
      filter: [
        this.filter,
        [
          DatasetSummaryBloom.RDF_SUBJECT,
          DatasetSummaryBloom.RDF_PREDICATE,
          DatasetSummaryBloom.RDF_OBJECT,
        ],
      ],
      filtersubject: [
        this.filterForSubject,
        [
          DatasetSummaryBloom.RDF_SUBJECT,
        ],
      ],
      filterpredicate: [
        this.filterForPredicate,
        [
          DatasetSummaryBloom.RDF_PREDICATE,
        ],
      ],
      filterobject: [
        this.filterForObject,
        [
          DatasetSummaryBloom.RDF_OBJECT,
        ],
      ],
    };
    for (const [ fragment, filterData ] of Object.entries(filtersToSerialize)) {
      const filterUri = DF.namedNode(`${this.dataset}#${fragment}`);
      const bitfieldBase64 = (<Buffer>(<any>filterData[0]).bitfield.toBuffer()).toString('base64');
      result.push(
        DF.quad(filterUri, DatasetSummaryBloom.RDF_TYPE, DatasetSummaryBloom.MEM_BLOOMFILTER),
        DF.quad(filterUri, DatasetSummaryBloom.MEM_COLLECTION, DF.namedNode(this.dataset.toString())),
        DF.quad(filterUri, DatasetSummaryBloom.MEM_BITSIZE, DF.literal(
          this.filterSize.toString(10),
          DatasetSummaryBloom.XSD_INTEGER,
        )),
        DF.quad(filterUri, DatasetSummaryBloom.MEM_HASHSIZE, DF.literal(
          this.filterSlices.toString(10),
          DatasetSummaryBloom.XSD_INTEGER,
        )),
        DF.quad(filterUri, DatasetSummaryBloom.MEM_REPRESENTATION, DF.literal(
          bitfieldBase64,
          DatasetSummaryBloom.XSD_BASE64,
        )),
      );
      for (const member of filterData[1]) {
        result.push(
          DF.quad(filterUri, DatasetSummaryBloom.MEM_PROPERTY, member),
        );
      }
    }
    return result;
  }
}

export interface IDatasetSummaryBloomArgs extends IDatasetSummaryArgs {
  filterSize?: number;
  filterSlices?: number;
}
