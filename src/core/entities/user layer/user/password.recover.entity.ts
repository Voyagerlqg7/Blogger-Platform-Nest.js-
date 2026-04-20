export class PasswordRecoverEntity {
  constructor(
    public code: string | null,
    public expiresAt: Date | null,
  ) {}
}
