export class EmailConfirmationEntity {
  constructor(
    public confirmationCode: string | null,
    public expiresAt: Date | null,
    public isConfirmed: boolean | null,
  ) {}
}
