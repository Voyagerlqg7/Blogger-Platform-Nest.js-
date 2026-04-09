export interface JwtPayload {
  userId: string; // userId
  deviceId: string; // for refresh
  iat?: number; // issued at - auto
  exp?: number; // expiration time - auto
}
