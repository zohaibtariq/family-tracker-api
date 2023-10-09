export function addMinutesToUnixTimestamp(timestamp, minutesToAdd) {
  // Convert minutes to milliseconds (1 minute = 60,000 milliseconds)
  const millisecondsToAdd = minutesToAdd * 60000;

  // Calculate the new Unix timestamp
  const newTimestamp = timestamp + millisecondsToAdd;

  return newTimestamp;
}

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
