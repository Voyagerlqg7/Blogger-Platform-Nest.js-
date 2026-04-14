//Auth
import { UseCase_CheckCredentials } from './application/UseCases/Auth/UseCase_CheckCredentials';
import { UseCase_GenerateTokens } from './application/UseCases/Auth/UseCase_GenerateTokens';
import { UseCase_RefreshTokens } from './application/UseCases/Auth/UseCase_RefreshTokens';
import { UseCase_RegisterUser } from './application/UseCases/Auth/UseCase_RegisterUser';
import { UseCase_Logout } from './application/UseCases/Auth/UseCase_Logout';

//Confirmations
import { UseCase_CheckRecoverCodePassword } from './application/UseCases/Confirmation/UseCase_CheckRecoverCodePassword';
import { UseCase_CheckEmailCodeConfirmation } from './application/UseCases/Confirmation/UseCase_CheckEmailCodeConfirmation';
import { UseCase_ResendCodeConfirmation } from './application/UseCases/Confirmation/UseCase_ResendCodeConfirmation';
import { UseCase_SendRecoverPasswordCode } from './application/UseCases/Confirmation/UseCase_SendRecoverPasswordCode';

//Events
import { UseCase_CreateSessionHandler } from './application/Events/CreateSession';
import { UseCase_SendConfirmationEmailHandler } from './application/Events/SendConfirmationMessage';
import { UseCase_GetAllDevices } from './application/UseCases/Security/UseCase_GetAllDevices';
import { UseCase_DeleteDevice } from './application/UseCases/Security/UseCase_DeleteSessionById';
import { UseCase_DeleteAllDevices } from './application/UseCases/Security/UseCase_DeleteAllSessionsExcludeCurrent';

export const userAccountsUseCases = [
  //Auth
  UseCase_CheckCredentials,
  UseCase_GenerateTokens,
  UseCase_RefreshTokens,
  UseCase_RegisterUser,
  UseCase_Logout,
  //Confirmations
  UseCase_CheckRecoverCodePassword,
  UseCase_CheckEmailCodeConfirmation,
  UseCase_ResendCodeConfirmation,
  UseCase_SendRecoverPasswordCode,
  //Devices
  UseCase_GetAllDevices,
  UseCase_DeleteDevice,
  UseCase_DeleteAllDevices,
];
export const userAccountsEvents = [
  UseCase_CreateSessionHandler,
  UseCase_SendConfirmationEmailHandler,
];
