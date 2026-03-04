import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Token, TokenDocument } from '../domain/token.entity';
import type { TokenModelType } from '../domain/token.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class TokensRepository {
  constructor(@InjectModel(Token.name) private tokenModel: TokenModelType) {}

  async findToken(token: string): Promise<TokenDocument> {
    const tokenInD = await this.tokenModel.findOne({ token });
    if (!tokenInD) {
      throw DomainException.notFound('token');
    }
    return tokenInD;
  }

  async saveToken(token: string): Promise<string | null> {
    const doc = await this.tokenModel.create({ _id: token, token });
    console.log('SAVED TOKEN', doc.token);
    return doc.token;
  }

  async deleteToken(token: string): Promise<true | null> {
    const result = await this.tokenModel.deleteOne({ token });
    return result ? true : null;
  }
}
