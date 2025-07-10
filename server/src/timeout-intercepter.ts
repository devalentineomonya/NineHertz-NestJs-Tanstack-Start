import {
  CallHandler,
  ExecutionContext,
  GatewayTimeoutException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutInMillis: number) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const url = request.url;

    if (url.includes('/seed')) {
      return next.handle();
    }

    return next.handle().pipe(
      timeout(this.timeoutInMillis),
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          throw new GatewayTimeoutException('Gateway timeout has occurred');
        }
        throw err;
      }),
    );
  }
}
