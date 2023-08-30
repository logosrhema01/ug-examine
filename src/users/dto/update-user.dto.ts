import { IsEmail, IsPhoneNumber } from 'class-validator';

export class UpdateUserDto {
  fullName?: string;

  @IsEmail()
  email?: string;

  @IsPhoneNumber()
  phoneNumber?: string;
}
