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
    let message = 'Internal Server Error';
    console.log('GENERIC EXCEPTION');
    console.log(exception);
    console.log(exception.status);
    console.log(exception.response);
    // console.log(exception.getStatus());
    // console.log(exception.getResponse());
    // if (exception instanceof HttpException) {
    status = exception.status;
    message =
      (exception.response && exception.response['message']
        ? exception.response['message']
        : '') ||
      exception.response ||
      'An error occurred';
    // }
    // TODO: should be converted to this.responseService.response()
    if (status === HttpStatus.FORBIDDEN)
      this.responseService.forbidden(response, message);
    else if (status === HttpStatus.UNAUTHORIZED)
      this.responseService.unauthorized(response, message);
    else if (status === HttpStatus.BAD_REQUEST)
      this.responseService.badRequest(response, message);
    else this.responseService.serverError(response, message);
  }
}
