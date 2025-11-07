import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class OptionalParseArrayPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): string[] | undefined {
    if (typeof value === 'undefined' || value === null || value === '') {
      return undefined;
    }
    // Se já é um array, retornar como está
    if (Array.isArray(value)) {
      return value;
    }
    // Se é string, tentar converter para array (separado por vírgula)
    if (typeof value === 'string') {
      return value.split(',').filter((item) => item.trim() !== '');
    }
    return undefined;
  }
}

