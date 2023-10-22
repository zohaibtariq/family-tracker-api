import { Types } from 'mongoose';

export interface AuthorizationHeaderInterface {
  authorization: string;
}

export interface JWTUserInterface {
  sub: Types.ObjectId;
  iat: number;
  exp: number;
  id: Types.ObjectId;
  role: string;
  refreshToken: string;
}

export interface RequestUserInterface {
  user: JWTUserInterface;
  headers: AuthorizationHeaderInterface;
  group: any;
  i18nLang: any;
  i18nService: any;
  i18nContext: any;
}
