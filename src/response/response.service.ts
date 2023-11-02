import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';

interface Meta {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

@Injectable()
export class ResponseService {
  response(
    res: Response,
    data: any = {} || [],
    message: string = '',
    statusCode: number = HttpStatus.OK,
    meta: Meta = {
      totalItems: 0,
      itemsPerPage: 0,
      currentPage: 0,
      totalPages: 0,
    },
  ) {
    const isDataArray = Array.isArray(data);
    const status = this.getStatus(statusCode);
    const responseData = {
      status: status,
      // data: isDataArray ? { items: data } : { item: data },
      data: isDataArray ? { items: data } : data,
      message,
    };
    if (
      isDataArray &&
      meta?.totalItems &&
      meta?.itemsPerPage &&
      meta?.currentPage &&
      meta?.totalPages
    ) {
      responseData['meta'] = {
        totalItems: meta?.totalItems,
        itemsPerPage: meta?.itemsPerPage,
        currentPage: meta?.currentPage,
        totalPages: meta?.totalPages,
      };
    }
    return res.status(statusCode).json(responseData);
  }

  getStatus(statusCode) {
    switch (statusCode) {
      case HttpStatus.OK:
      case HttpStatus.NO_CONTENT:
      case HttpStatus.CREATED:
        return 'success';
        break;
      case HttpStatus.BAD_REQUEST:
        return 'fail';
        break;
      default:
        return 'error';
        break;
    }
  }

  success(res: Response, message: string = '', data: any = {}) {
    return res
      .status(HttpStatus.OK)
      .json({ status: this.getStatus(HttpStatus.OK), data, message });
    // CATERED
    // {
    //   "status": "success",
    //   "data": {
    //     // Your data here
    //   }
    // }

    // MISSING PAGINATED ONE
    // {
    //   "status": "success",
    //   "data": {
    //     "items": [/* Array of paginated items */],
    //       "total": /* Total number of items */,
    //     "page": /* Current page number */,
    //     "pageSize": /* Number of items per page */,
    //     "pages": /* Total number of pages */
    //   }
    // }
  }

  validationFailed(res: Response, message: string, errors: []) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: this.getStatus(HttpStatus.BAD_REQUEST),
      message,
      errors,
    });
    // {
    //   "status": "fail",
    //   "message": "Validation failed",
    //   "errors": [
    //     // Array of validation errors
    //   ]
    // }
  }

  unauthorized(res: Response, message: string = 'Unauthorized') {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ status: this.getStatus(HttpStatus.UNAUTHORIZED), message });
    // {
    //   "status": "error",
    //   "message": "Unauthorized"
    // }
  }

  serverError(res: Response, message: string = 'Internal Server Error') {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: this.getStatus(HttpStatus.INTERNAL_SERVER_ERROR),
      message,
    });
    // {
    //   "status": "error",
    //   "message": "Internal Server Error"
    // }
  }

  forbidden(res: Response, message: string = 'Forbidden') {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ status: this.getStatus(HttpStatus.FORBIDDEN), message });
    // {
    //   "status": "error",
    //   "message": "Forbidden"
    // }
  }

  badRequest(res: Response, message: string = 'Bad Request') {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ status: this.getStatus(HttpStatus.BAD_REQUEST), message });
    // {
    //   "status": "error",
    //   "message": "Bad Request"
    // }
  }
}
