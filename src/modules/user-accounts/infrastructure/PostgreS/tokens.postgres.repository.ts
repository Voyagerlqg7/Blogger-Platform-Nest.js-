import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPostgresEntity } from '../../domain/PostgreS/token.postgres.entity';
import { Repository } from 'typeorm';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { ITokensRepository } from '../../../../core/repositories/ITokensRepository';

@Injectable()
export class TokensPostgresRepository implements ITokensRepository {
  constructor(
    @InjectRepository(TokenPostgresEntity)
    private readonly tokensRepository: Repository<TokenPostgresEntity>,
  ) {}
  //TODO: RAW SQL
  async findByToken(token: string): Promise<TokenPostgresEntity> {

  }

  async saveToken(token: string): Promise<string> {

  }

  async deleteToken(token: string): Promise<void> {

  }

  async deleteTokenById(id: string): Promise<void> {

  }

  async deleteAllTokensExceptOne(currentToken: string): Promise<number> {

  }

  async deleteExpiredTokens(): Promise<number> {

  }

  async exists(token: string): Promise<boolean> {

  }
}
