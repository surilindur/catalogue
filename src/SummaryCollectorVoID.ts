import { DatasetSummaryVoID } from './DatasetSummaryVoID';
import { SummaryCollector } from './SummaryCollector';

/**
 * Class for collecting Vocabulary of Interlinked Datasets descriptions
 * for datasets. See: https://www.w3.org/TR/void/
 */
export class SummaryCollectorVoID extends SummaryCollector<DatasetSummaryVoID> {
  protected getSummary(dataset: string): DatasetSummaryVoID {
    let summary = this.datasetSummariesByDataset.get(dataset);
    if (!summary) {
      summary = new DatasetSummaryVoID({ dataset });
      this.datasetSummariesByDataset.set(dataset, summary);
    }
    return summary;
  }
}
