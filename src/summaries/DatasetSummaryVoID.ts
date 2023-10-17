import type * as RDF from '@rdfjs/types';
import { AsyncIterator } from 'asynciterator';
import { DataFactory } from 'rdf-data-factory';
import type { QuadWithSource } from '..';
import { RDFS, XSD, VoID } from '../common/Namespaces';
import { DatasetSummary } from './DatasetSummary';

export class DatasetSummaryVoID extends DatasetSummary {
  public async from(stream: AsyncIterator<QuadWithSource>): Promise<AsyncIterator<RDF.Quad>> {
    const output = new AsyncIterator<RDF.Quad>();
    const descriptions: Map<string, IVoIDDescription> = new Map();
    stream.on('data', (quad: QuadWithSource) => {
      const dataset = this.sourceToDataset(quad.source);
      if (dataset) {
        let description = descriptions.get(dataset);
        if (!description) {
          description = {
            dataset,
            triples: 0,
            classes: new Set(),
            distinctObjects: new Set(),
            distinctSubjects: new Set(),
            classPartitions: new Map(),
            propertyPartitions: new Map(),
          };
          descriptions.set(dataset, description);
        }
        description.triples++;
        if (quad.subject.termType === 'NamedNode') {
          description.distinctSubjects.add(quad.subject.value);
        }
        if (quad.object.termType === 'NamedNode') {
          description.distinctObjects.add(quad.object.value);
        }
        if (quad.predicate.termType === 'NamedNode') {
          let propertyPartition = description.propertyPartitions.get(quad.predicate.value);
          if (!propertyPartition) {
            propertyPartition = {
              distinctObjects: new Set(),
              distinctSubjects: new Set(),
              triples: 0,
            };
            description.propertyPartitions.set(quad.predicate.value, propertyPartition);
          }
          propertyPartition.triples++;
          if (quad.subject.termType === 'NamedNode') {
            propertyPartition.distinctObjects.add(quad.object.value);
          }
          if (quad.object.termType === 'NamedNode') {
            propertyPartition.distinctSubjects.add(quad.subject.value);
            if (quad.predicate.value === RDFS.type.value) {
              description.classes.add(quad.object.value);
              if (quad.subject.termType === 'NamedNode') {
                let classPartition = description.classPartitions.get(quad.object.value);
                if (!classPartition) {
                  classPartition = {
                    entities: new Set(),
                  };
                  description.classPartitions.set(quad.object.value, classPartition);
                }
                classPartition.entities.add(quad.subject.value);
              }
            }
          }
        }
      }
    }).on('end', () => {
      const df = new DataFactory();
      for (const [ uri, desc ] of descriptions) {
        const ds = df.namedNode(uri);
        output.append([
          df.quad(ds, RDFS.type, VoID.Dataset),
          df.quad(ds, RDFS.type, VoID.DatasetDescription),
          df.quad(ds, VoID.uriSpace, df.literal(uri, XSD.string)),
          df.quad(ds, VoID.triples, df.literal(desc.triples.toString(10), XSD.integer)),
          df.quad(ds, VoID.classes, df.literal(desc.classes.size.toString(10), XSD.integer)),
          df.quad(ds, VoID.properties, df.literal(desc.propertyPartitions.size.toString(10), XSD.integer)),
          df.quad(ds, VoID.distinctObjects, df.literal(desc.distinctObjects.size.toString(10), XSD.integer)),
          df.quad(ds, VoID.distinctSubjects, df.literal(desc.distinctSubjects.size.toString(10), XSD.integer)),
        ]);
        for (const [ prop, part ] of desc.propertyPartitions) {
          const pp = df.blankNode();
          output.append([
            df.quad(ds, VoID.propertyPartition, pp),
            df.quad(pp, RDFS.type, VoID.Dataset),
            df.quad(pp, VoID.property, df.namedNode(prop)),
            df.quad(pp, VoID.triples, df.literal(part.triples.toString(10), XSD.integer)),
            df.quad(pp, VoID.distinctObjects, df.literal(part.distinctObjects.size.toString(10), XSD.integer)),
            df.quad(pp, VoID.distinctSubjects, df.literal(part.distinctSubjects.size.toString(10), XSD.integer)),
          ]);
        }
        for (const [ cls, part ] of desc.classPartitions) {
          const cp = df.blankNode();
          output.append([
            df.quad(ds, VoID.classPartition, cp),
            df.quad(cp, RDFS.type, VoID.Dataset),
            df.quad(cp, VoID.class, df.namedNode(cls)),
            df.quad(cp, VoID.entities, df.literal(part.entities.size.toString(10), XSD.integer)),
          ]);
        }
      }
      output.emit('end');
    }).on('error', error => output.emit('error', error));

    return output;
  }
}

export interface IVoIDDescription {
  dataset: string;
  triples: number;
  classes: Set<string>;
  distinctSubjects: Set<string>;
  distinctObjects: Set<string>;
  propertyPartitions: Map<string, IVoIDDescriptionPropertyPartition>;
  classPartitions: Map<string, IVoIDDescriptionClassPartition>;
}

export interface IVoIDDescriptionPropertyPartition {
  distinctSubjects: Set<string>;
  distinctObjects: Set<string>;
  triples: number;
}

export interface IVoIDDescriptionClassPartition {
  entities: Set<string>;
}
