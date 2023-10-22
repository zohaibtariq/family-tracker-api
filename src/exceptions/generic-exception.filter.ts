import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ResponseService } from '../response/response.service';

@Catch()
export class GenericExceptionFilter implements ExceptionFilter {
  constructor(private readonly responseService: ResponseService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An Unknown Server Error';
    console.log('GENERIC EXCEPTION');
    console.log(exception);
    console.log(exception.status);
    console.log(exception.response);
    status = exception?.status || status;
    message =
      (exception?.response && exception?.response['message']
        ? exception?.response['message']
        : '') ||
      exception?.response ||
      message;
    if (status === 404 && !exception.response) message = '404 Not Found';
    this.responseService.response(response, {}, message, status);
  }
}
