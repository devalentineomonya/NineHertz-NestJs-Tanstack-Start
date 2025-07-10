import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const statusCode = response.status;
    console.dir(statusCode, { depth: null });

    return next.handle().pipe(
      map((data: unknown) => {
        if (statusCode === 204) return data;

        const success = statusCode >= 200 && statusCode < 400;
        if (typeof data === 'string') {
          return { success, message: data } as const;
        } else if (data !== null && data !== undefined) {
          return { success, data } as const;
        } else {
          return { success } as const;
        }
      }),
    );
  }
}
