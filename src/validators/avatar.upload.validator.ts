// import { FileValidator } from '@nestjs/common';
// import { identifyImageMimeType } from './../utils/helpers';
// import * as fs from 'fs';
//
// export interface CustomUploadTypeValidatorOptions {
//   fileType: string[];
// }
//
// export class AvatarUploadValidator extends FileValidator {
//   private _allowedMimeTypes: string[];
//
//   constructor(
//     protected readonly validationOptions: CustomUploadTypeValidatorOptions, // private readonly i18n: I18nService,
//   ) {
//     super(validationOptions);
//     this._allowedMimeTypes = this.validationOptions.fileType;
//   }
//
//   public isValid(file?: Express.Multer.File): boolean {
//     const fileMimeType = identifyImageMimeType(file.path);
//     const isValid = this._allowedMimeTypes.includes(fileMimeType);
//     console.log('isValid');
//     console.log(file);
//     // console.log(isValid);
//     if (!isValid) fs.unlinkSync(file.path); // IMPORTANT: we can read file mime type from buffer or original content here so if not amongst allowed one so remove it
//     // console.log('isValid');
//     // console.log(isValid);
//     return isValid;
//   }
//
//   // public buildErrorMessage(@I18n() i18n: I18nContext): string {
//   public buildErrorMessage(): string {
//     // console.log(this.i18n.t('auth.TOKEN_REVOKED'));
//     // console.log(i18n.t('auth.TOKEN_REVOKED'));
//     return `Upload not allowed. Upload only files of type: ${this._allowedMimeTypes.join(
//       ', ',
//     )} are allowed for upload`;
//   }
// }
