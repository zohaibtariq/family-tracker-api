import { Types } from 'mongoose';

export interface RequestUserInterface {
  role: string;
  sub: Types.ObjectId;
  id: Types.ObjectId;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequestUser {
  user: RequestUserInterface;
}
