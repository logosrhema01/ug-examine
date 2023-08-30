import { User } from 'src/users/entities/user.entity';

export interface JWTPayload {
  username: string;
  role: string;

  // exclude password from user object
  user: User;
}

export class SignInResponse {
  access_token: string;
}
