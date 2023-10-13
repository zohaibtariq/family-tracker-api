import { FileValidator } from '@nestjs/common';

export interface CustomUploadTypeValidatorOptions {
  fileType: string[];
}

export class CustomUploadFileTypeValidator extends FileValidator {
  private _allowedMimeTypes: string[];

  constructor(
    protected readonly validationOptions: CustomUploadTypeValidatorOptions,
  ) {
    super(validationOptions);
    this._allowedMimeTypes = this.validationOptions.fileType;
  }

  public async isValid(file?: Express.Multer.File): Promise<boolean> {
    console.log('ISVALID');
    console.log(file);
    console.log('Allowed Mime Types');
    console.log(this._allowedMimeTypes);
    // console.log(await fileTypeFromBuffer(file.buffer));

    // const response = fileType.default(file.buffer);

    // console.log('FILE RESP ISVALID');
    // console.log(response);

    return this._allowedMimeTypes.includes(file.mimetype);
    // return true;
  }

  public buildErrorMessage(): string {
    return `Upload not allowed. Upload only files of type: ${this._allowedMimeTypes.join(
      ', ',
    )}`;
  }
}
