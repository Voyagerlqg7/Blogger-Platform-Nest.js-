import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Token, TokenDocument } from '../domain/Mongo/token.mongo.entity';
import type { TokenModelType } from '../domain/Mongo/token.mongo.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class TokensMongoRepository {
  constructor(@InjectModel(Token.name) private tokenModel: TokenModelType) {}

  async findToken(token: string): Promise<TokenDocument> {
    const tokenInD = await this.tokenModel.findOne({ token });
    if (!tokenInD) {
      throw DomainException.notFound('token');
    }
    return tokenInD;
  }

  async saveToken(token: string): Promise<string> {
    const doc = await this.tokenModel.create({ token });
    return doc.token;
  }

  async deleteToken(token: string): Promise<void> {
    await this.tokenModel.deleteOne({ token });
  }

  async deleteAllTokensExceptOne(currentToken: string): Promise<number> {
    const result = await this.tokenModel.deleteMany({
      token: { $ne: currentToken },
    });
    return result.deletedCount;
  }
}
