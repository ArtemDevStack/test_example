export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  email: string;
  password: string;
}
