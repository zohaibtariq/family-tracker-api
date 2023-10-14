// import { ObjectId } from 'mongoose';
// import mongoose from 'mongoose';
import { Types } from 'mongoose';

// const Schema = mongoose.Schema;

export interface RequestUserInterface {
  role: string;
  // sub: ObjectId;
  // sub: mongoose.Schema.Types.ObjectId;
  sub: Types.ObjectId;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequestUser {
  user: RequestUserInterface;
}
