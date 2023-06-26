import { existsSync, lstatSync, readdirSync, readFileSync, type Stats } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { DataLoader, type IDataLoaderArgs } from '@catalogue/data-loader';
import type * as RDF from '@rdfjs/types';
import { Parser } from 'n3';

export class DataLoaderFilesystem extends DataLoader {
  private readonly root: string;
  private readonly groupingKey: RegExp;
  private readonly data: Map<string, RDF.Quad[]>;

  public constructor(args: IDataLoaderFilesystemArgs) {
    super(args);
    this.root = resolve(args.path);
    if (!existsSync(this.root)) {
      throw new Error(`The root path "${this.root}" does not exist`);
    }
    this.groupingKey = new RegExp(args.grouping, 'u');
    this.data = new Map();
  }

  public async load(): Promise<Map<string, RDF.Quad[]>> {
    if (this.data.size === 0) {
      await this.loadPath(this.root);
    }
    return this.data;
  }

  private getGroupingKey(path: string): string {
    const relativeToRoot: string = relative(this.root, path);
    const match: RegExpExecArray | null = this.groupingKey.exec(relativeToRoot);
    return match !== null ? match[0] : relativeToRoot;
  }

  private async loadPath(path: string): Promise<void> {
    const stat: Stats = lstatSync(path);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path)) {
        await this.loadPath(join(path, entry));
      }
    } else if (stat.isFile()) {
      await this.loadFile(path);
    }
  }

  private async loadFile(path: string): Promise<void> {
    const key: string = this.getGroupingKey(path);
    const parser: Parser = new Parser();
    const fileContents: string = readFileSync(path, { encoding: 'utf-8' });
    const quads: RDF.Quad[] = parser.parse(fileContents);
    if (this.data.has(key)) {
      this.data.get(key)!.push(...quads);
    } else {
      this.data.set(key, quads);
    }
  }
}

export interface IDataLoaderFilesystemArgs extends IDataLoaderArgs {
  path: string;
  grouping: string;
}
