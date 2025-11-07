import {
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';

export const OptionalActiveUserId = createParamDecorator<undefined>(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.userId || null;
  },
);


