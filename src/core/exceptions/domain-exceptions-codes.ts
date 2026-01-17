export enum DomainExceptionCode {
  NotFound = 1,
  BadRequest = 2,
  InternalServerError = 3,
  Forbidden = 4,
  ValidationError = 5,

  //auth errors
  Unauthorized = 11,
  EmailNotConfirmed = 12,
  ConfirmationCodeExpired = 13,
  PasswordRecoveryCodeExpired = 14,
  WrongPasswordRecoveryCode = 15,
  InvalidCredentials = 16,
}

// 1–10    — domain
// 11–20   — auth
// 21–30   — payments
// 31–40   — subscriptions
