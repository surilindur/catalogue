import { DatasetSummaryBloom } from '../summaries/DatasetSummaryBloom';
import { type ISummaryCollectorArgs, SummaryCollector } from './SummaryCollector';

/**
 * Class for generating Bloom filters for datasets.
 */
export class SummaryCollectorBloom extends SummaryCollector<DatasetSummaryBloom> {
  private readonly bloemSize: number;
  private readonly bloemSlices: number;

  public constructor(args: ISummaryCollectorBloomArgs) {
    super(args);
    this.bloemSize = args.bloemSize;
    this.bloemSlices = args.bloemSlices;
  }

  protected getSummary(dataset: string): DatasetSummaryBloom {
    let summary = this.datasetSummariesByDataset.get(dataset);
    if (!summary) {
      summary = new DatasetSummaryBloom({ dataset, size: this.bloemSize, slices: this.bloemSlices });
      this.datasetSummariesByDataset.set(dataset, summary);
    }
    return summary;
  }
}

export interface ISummaryCollectorBloomArgs extends ISummaryCollectorArgs {
  bloemSize: number;
  bloemSlices: number;
}
