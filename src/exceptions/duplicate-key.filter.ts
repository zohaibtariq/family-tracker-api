import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class DuplicateKeyExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    console.error('DuplicateKeyExceptionFilter');
    console.error(exception);
    const response = host.switchToHttp().getResponse();
    const statusCode = 400; // Bad Request
    const error = 'Bad Request';
    if (exception.code === 11000) {
      // Duplicate key error (code 11000)
      const CustomError: any = { ...exception };
      response.status(statusCode).json({
        message: [
          `${Object.keys(CustomError?.keyValue)[0]} value must be unique`,
        ],
        error,
        statusCode,
      });
    } else {
      response.status(statusCode).json({
        message: ['An error occurred.'],
        error,
        statusCode,
      });
    }
  }
}
