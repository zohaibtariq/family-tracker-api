import { diskStorage } from 'multer';
import { HttpException, HttpStatus } from '@nestjs/common';
import { extname } from 'path';

export const MAX_FILE_SIZE_IN_BYTES = 2 * 1024 * 1024;

export const VALID_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/svg+xml',
];

export const imageFileFilter = (req, file, cb) => {
  console.log('Uploaded File');
  console.log(file);
  if (
    VALID_IMAGE_MIME_TYPES.includes(file.mimetype) &&
    file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
  ) {
    console.log('Uploaded File Size');
    console.log(file.size);
    console.log('Allowed File Size');
    console.log(MAX_FILE_SIZE_IN_BYTES);
    if (file.size <= MAX_FILE_SIZE_IN_BYTES) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          'File size exceeds the limit',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
        false,
      );
    }
  } else {
    cb(
      new HttpException(
        'File type ' + file.mimetype + ' is not allowed.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      ),
      false,
    );
  }
};

export const editFileName = (req, file, callback) => {
  // console.log(req.user.sub);
  // const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  // const randomName = Array(4)
  //   .fill(null)
  //   .map(() => Math.round(Math.random() * 16).toString(16))
  //   .join('');
  // let fileName = `${name}-${randomName}${fileExtName}`;
  const fileName = `${req.user.sub}${fileExtName}`;
  callback(null, fileName);
};

export const multerLocalOptionsStorage = diskStorage({
  destination: 'public/avatars',
  filename: editFileName,
});

export const multerLocalOptions = {
  storage: multerLocalOptionsStorage,
  fileFilter: imageFileFilter,
};

// export const imageStorage = diskStorage({
//   // destination: './uploads', // Set your upload directory
//   // filename: (req, file, cb) => {
//   //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//   //   cb(null, uniqueSuffix + path.extname(file.originalname));
//   // },
//   filename: editFileName,
//   fileFilter: imageFileFilter,
// });

// export const imageFileFilter2 = (req, file, callback) => {
//   if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
//     return callback(new Error('Only image files are allowed!'), false);
//   }
//   callback(null, true);
// };

// {
// storage: diskStorage({
// as soon as I enable this diskStorage file.buffer not populated
// destination: 'public/avatars',
// filename: editFileName(),
// filename: (req, file, cb) => {
//   cb(null, file.originalname);
// },
// }),
// fileFilter: imageFileFilter,
// }
