import { diskStorage } from 'multer';
import { HttpException, HttpStatus } from '@nestjs/common';
import { extname } from 'path';
import * as fs from 'fs';

export const MAX_FILE_SIZE_IN_BYTES = 20 * 1024 * 1024;

export const VALID_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/svg+xml',
];

// export function addMinutesToUnixTimestamp(timestamp, minutesToAdd) {
//   // Convert minutes to milliseconds (1 minute = 60,000 milliseconds)
//   const millisecondsToAdd = minutesToAdd * 60000;
//
//   // Calculate the new Unix timestamp
//   const newTimestamp = timestamp + millisecondsToAdd;
//
//   return newTimestamp;
// }

export function subtractMinutesToUnixTimestamp(timestamp, minutesToSubtract) {
  // Convert minutes to milliseconds (1 minute = 60,000 milliseconds)
  const millisecondsToSubtract = minutesToSubtract * 60000;

  // Calculate the new Unix timestamp
  const newTimestamp = timestamp - millisecondsToSubtract;

  return newTimestamp;
}

export function addSecondsToUnixTimestamp(timestamp, secondsToAdd) {
  // Convert seconds to milliseconds (1 second = 1000 milliseconds)
  const millisecondsToAdd = secondsToAdd * 1000;

  // Calculate the new Unix timestamp
  const newTimestamp = timestamp + millisecondsToAdd;

  return newTimestamp;
}

export function subtractSecondsToUnixTimestamp(timestamp, secondsToSubtract) {
  // Convert seconds to milliseconds (1 second = 1000 milliseconds)
  const millisecondsToSubtract = secondsToSubtract * 1000;

  // Calculate the new Unix timestamp
  const newTimestamp = timestamp - millisecondsToSubtract;

  return newTimestamp;
}

export function generateNumericString(
  length: number,
  numberArray: number[],
): string {
  if (length <= 0 || numberArray.length === 0) {
    throw new Error(
      'Invalid input. Length must be greater than 0, and numberArray must not be empty.',
    );
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * numberArray.length);
    const selectedNumber = numberArray[randomIndex];
    result += selectedNumber.toString();
  }

  return result;
}

export function replacePlaceholders(inputString, placeholders) {
  // Create a regular expression pattern that matches placeholders, e.g., {{placeholder}}
  const placeholderPattern = /\{\{(\w+)\}\}/g;
  // Use the replace method with a callback function to replace placeholders
  const replacedString = inputString.replace(
    placeholderPattern,
    (match, placeholder) => {
      // Check if the placeholder exists in the provided placeholders object
      if (placeholders.hasOwnProperty(placeholder)) {
        return placeholders[placeholder];
      }
      // If the placeholder is not found, leave it unchanged
      return match;
    },
  );
  return replacedString;
}

export const createFolder = (folderPath) => {
  try {
    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
      // If the folder doesn't exist, create it
      fs.mkdirSync(folderPath, { recursive: true });
      return 'Folder created successfully';
    } else {
      return 'Folder already exists';
    }
  } catch (error) {
    return `Error creating folder: ${error.message}`;
  }
};

export const deleteAllFromDestExcludingOne = (directoryPath, fileToExclude) => {
  try {
    // Read the contents of the directory
    const filesInDirectory = fs.readdirSync(directoryPath);

    // Filter out the file to exclude
    const filesToDelete = filesInDirectory.filter(
      (file) => file !== fileToExclude,
    );

    // Delete each file in the directory
    for (const file of filesToDelete) {
      const filePath = `${directoryPath}/${file}`;
      fs.unlinkSync(filePath);
      // console.log(`Deleted: ${file}`);
    }

    // console.log(`All files deleted except the ${fileToExclude}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

export const identifyImageMimeType = (filePath) => {
  // Define file signatures for common image types
  const fileSignatures = {
    '\xFF\xD8\xFF': 'image/jpeg',
    '\x89PNG\x0D\x0A\x1A\x0A': 'image/png',
    GIF89a: 'image/gif',
    BM: 'image/bmp',
    'RIFF....WEBP': 'image/webp',
    '<svg': 'image/svg+xml',
    WEBP: 'image/webp',
    RIF: 'image/webp',
    RIFF: 'image/webp',
  };

  const fileBuffer = fs.readFileSync(filePath);

  // Compare the first few bytes of the file to file signatures
  for (const signature in fileSignatures) {
    const binaryFile = fileBuffer.slice(0, signature.length).toString('binary');
    // console.log('BINARY FILE');
    // console.log(binaryFile);
    if (binaryFile === signature) {
      return fileSignatures[signature];
    }
  }

  // If no matching signature is found, return an unknown MIME type
  return 'application/octet-stream';
};

export const imageFileFilter = (req, file, cb) => {
  if (
    VALID_IMAGE_MIME_TYPES.includes(file.mimetype) &&
    file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
  ) {
    // console.log('Uploaded File Size');
    // console.log(file.size);
    // console.log('Allowed File Size');
    // console.log(MAX_FILE_SIZE_IN_BYTES);
    //   if (file.size <= MAX_FILE_SIZE_IN_BYTES) { // IMPORTANT: we cannot enable this comment as we don't have file.size value here
    cb(null, true);
    //   } else {
    //     cb(
    //       new HttpException(
    //         'File size exceeds the limit',
    //         HttpStatus.UNPROCESSABLE_ENTITY,
    //       ),
    //       false,
    //     );
    //   }
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
  // console.log(req.user.id);
  // const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  // const randomName = Array(4)
  //   .fill(null)
  //   .map(() => Math.round(Math.random() * 16).toString(16))
  //   .join('');
  // let fileName = `${name}-${randomName}${fileExtName}`;
  const fileName = `${req.user.id}${fileExtName}`;
  callback(null, fileName);
};

export const multerLocalOptionsStorage = diskStorage({
  destination: (req: any, file, cb) => {
    const userId = req.user.id;
    const userUploadPath = `public/avatars/${userId}/avatar/`;
    createFolder(userUploadPath);
    cb(null, userUploadPath);
  },
  filename: editFileName,
});

export const multerLocalOptions = {
  storage: multerLocalOptionsStorage,
  fileFilter: imageFileFilter,
};

export function bytesToMB(bytes) {
  return bytes / (1024 * 1024);
}

export const generateUniqueCode = async (repository, field, desiredLength) => {
  let uniqueCode;
  let isUnique = false;

  // Define characters for the alphanumeric string
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;

  while (!isUnique) {
    // Generate a random alphanumeric string of the desired length
    uniqueCode = '';
    for (let i = 0; i < desiredLength; i++) {
      uniqueCode += characters.charAt(
        Math.floor(Math.random() * charactersLength),
      );
    }
    // uniqueCode = uniqueCode.toUpperCase();
    // Check if the generated code already exists in the database
    const existingDocument = await repository.findOne({ [field]: uniqueCode });

    if (!existingDocument) {
      isUnique = true; // Found a unique code
    }
  }

  return uniqueCode;
};

// Example usage with a desired length of 10:
// const desiredLength = 10;
// const uniqueCode = await generateUniqueCode(YourModel, 'yourUniqueColumn', desiredLength);
// 'uniqueCode' now contains a unique alphanumeric string of length 10
