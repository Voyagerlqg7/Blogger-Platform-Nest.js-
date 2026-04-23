export interface ITokensRepository {
  findByToken(token: string): Promise<any>;

  saveToken(token: string): Promise<string>;

  deleteToken(token: string): Promise<void>;

  deleteAllTokensExceptOne(currentToken: string): Promise<number>;

  exists(token: string): Promise<boolean>;
}
