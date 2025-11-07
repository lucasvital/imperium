import { ArgumentMetadata, ParseFloatPipe, Injectable } from '@nestjs/common';

@Injectable()
export class OptionalParseFloatPipe extends ParseFloatPipe {
  override transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'undefined' || value === null || value === '') {
      return undefined;
    }
    return super.transform(value, metadata);
  }
}

