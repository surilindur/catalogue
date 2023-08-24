import { FixedContentTypeMapper, trimTrailingSlashes, encodeUriPathComponents } from '@solid/community-server';

/**
 * Custom FixedContentTypeMapper to ignore .meta files
 */
export class FixedContentTypeMapperMeta extends FixedContentTypeMapper {
  protected async getDocumentUrl(relative: string): Promise<string> {
    return relative.endsWith('.meta') ?
      trimTrailingSlashes(this.baseRequestURI + encodeUriPathComponents(relative)) :
      super.getDocumentUrl(relative + this.urlSuffix);
  }
}
