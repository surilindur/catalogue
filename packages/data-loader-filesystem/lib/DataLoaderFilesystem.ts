import { existsSync, lstatSync, readdirSync, readFileSync, type Stats } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import type * as RDF from '@rdfjs/types';
import { DataLoader, type IDataLoaderArgs } from '@solidlab/catalogue-data-loader';
import { Parser } from 'n3';

export class DataLoaderFilesystem extends DataLoader {
  private readonly root: string;
  private readonly groupingExpression: RegExp;
  private readonly groupingLog: boolean;
  private readonly data: Map<string, RDF.Quad[]>;

  public constructor(args: IDataLoaderFilesystemArgs) {
    super(args);
    this.root = resolve(args.path);
    if (!existsSync(this.root)) {
      throw new Error(`The root path "${this.root}" does not exist`);
    }
    this.groupingExpression = new RegExp(args.grouping, 'u');
    this.groupingLog = args.groupingLog;
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
    const match = this.groupingExpression.exec(path)?.groups;
    if (this.groupingLog) {
      // eslint-disable-next-line no-console
      console.log('Group:', { path, match: match !== undefined, key: match?.key ?? relativeToRoot });
    }
    return match !== undefined ? match.key : relativeToRoot;
  }

  private async loadPath(path: string): Promise<void> {
    const stat: Stats = lstatSync(path);
    if (path.endsWith('.meta')) {
      // eslint-disable-next-line no-console
      console.log(`Skip: ${path}`);
    } else if (stat.isDirectory()) {
      for (const entry of readdirSync(path)) {
        await this.loadPath(join(path, entry));
      }
    } else if (stat.isFile()) {
      await this.loadFile(path);
    }
  }

  private async loadFile(path: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`Load: ${path}`);
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
  groupingLog: boolean;
}
