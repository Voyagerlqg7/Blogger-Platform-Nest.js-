export interface JwtPayload {
  userId: string; // userId
  userLogin: string; // userLogin
  deviceId?: string; // for refresh
  iat?: number; // issued at - auto
  exp?: number; // expiration time - auto
}
