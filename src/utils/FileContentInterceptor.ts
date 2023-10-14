// import {
//   CallHandler,
//   ExecutionContext,
//   HttpException,
//   HttpStatus,
//   Injectable,
//   NestInterceptor,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { identifyImageMimeType, VALID_IMAGE_MIME_TYPES } from './helpers';
//
// @Injectable()
// export class FileContentInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const req = context.switchToHttp().getRequest();
//     const file = req.file;
//
//     if (!file) {
//       return next.handle();
//     }
//
//     const fileMimeType = identifyImageMimeType(file.path);
//     const isValid = VALID_IMAGE_MIME_TYPES.includes(fileMimeType);
//     if (!isValid)
//       throw new HttpException('Invalid file content', HttpStatus.BAD_REQUEST);
//     //
//     // const readStream = fs.createReadStream(file.path, 'utf8');
//     // let fileContent = '';
//     //
//     // readStream.on('data', (chunk) => {
//     //   fileContent += chunk;
//     // });
//     //
//     // return new Observable((subscriber) => {
//     //   readStream.on('end', () => {
//     //     // Check if the file content is valid (e.g., mime type or other criteria)
//     //     if (!isValidFileContent(fileContent)) {
//     //       fs.unlinkSync(file.path); // Delete the file if it's not valid
//     //       throw new HttpException(
//     //         'Invalid file content',
//     //         HttpStatus.BAD_REQUEST,
//     //       );
//     //     }
//     //
//     //     req.fileContent = fileContent; // Attach the file content to the request
//     //     subscriber.next(fileContent);
//     //     subscriber.complete();
//     //   });
//     //
//     //   readStream.on('error', (error) => {
//     //     fs.unlinkSync(file.path); // Delete the file in case of an error
//     //     subscriber.error(error);
//     //   });
//     // });
//   }
// }
//
// function isValidFileContent(fileContent: string): boolean {
//   console.log('fileContent');
//   console.log(fileContent);
//   // Implement your file content validation logic here
//   // Return true if valid, false otherwise
//   return true; // Modify this according to your validation criteria
// }
