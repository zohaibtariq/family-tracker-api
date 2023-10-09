import { IsInt, IsString, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

class EnvironmentVariables {
  @IsString({ message: 'Invalid NODE_ENV' })
  NODE_ENV: string;

  @IsInt({ message: 'Invalid NODE_APP_PORT' })
  NODE_APP_PORT: number;

  @IsString({ message: 'Invalid MONGODB_URI' })
  MONGODB_URI: string;

  @IsString({ message: 'Invalid MONGODB_TEST_URI' })
  MONGODB_TEST_URI: string;

  // @IsString({ message: 'Invalid ELASTIC_SEARCH_userName' })
  // ELASTIC_SEARCH_userName: string;

  // @IsString({ message: 'Invalid ELASTIC_PASSWORD' })
  // ELASTIC_PASSWORD: string;

  // @IsString({ message: 'Invalid ELASTIC_SEARCH_HOST' })
  // ELASTIC_SEARCH_HOST: string;
  //
  // @IsInt({ message: 'Invalid ELASTIC_SEARCH_PORT' })
  // ELASTIC_SEARCH_PORT: number;
  //
  // @IsInt({ message: 'Invalid ELASTIC_SEARCH_MAX_RETRIES' })
  // ELASTIC_SEARCH_MAX_RETRIES: number;
  //
  // @IsInt({ message: 'Invalid ELASTIC_SEARCH_REQ_TIMEOUT' })
  // ELASTIC_SEARCH_REQ_TIMEOUT: number;

  @IsString({ message: 'Invalid JWT_ACCESS_SECRET' })
  JWT_ACCESS_SECRET: string;

  @IsString({ message: 'Invalid JWT_REFRESH_SECRET' })
  JWT_REFRESH_SECRET: string;

  @IsString({ message: 'Invalid JWT_ACCESS_TOKEN_EXPIRES_IN' })
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString({ message: 'Invalid JWT_REFRESH_TOKEN_EXPIRES_IN' })
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;

  // @IsString({ message: 'Invalid ELASTIC_SEARCH_INDEX' })
  // ELASTIC_SEARCH_INDEX: string;

  @IsString({ message: 'Invalid FALLBACK_LANGUAGE' })
  FALLBACK_LANGUAGE: string;
}

export const validate = (config: Record<string, unknown>) => {
  // IMPORTANT: `plainToClass` to converts plain object into Class
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  // `validateSync` method validate the class and returns errors
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};
