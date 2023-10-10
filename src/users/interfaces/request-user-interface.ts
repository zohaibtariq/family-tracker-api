export interface RequestUserInterface {
  role: string;
  sub: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequestUser {
  user: RequestUserInterface;
}
