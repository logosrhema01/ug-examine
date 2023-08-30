import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { JWTPayload, SignInResponse } from './auth.types';
import { SignInDto } from 'src/users/dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async signIn({
    username,
    password,
  }: SignInDto): Promise<SignInResponse> {
    const user = await this.usersService.signIn(username, password);

    if (!user) {
      throw new UnauthorizedException();
    }
    const payload: JWTPayload = {
      username: user.username,
      role: user.role,
      user,
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      }),
    };
  }

  public async signUp(createUserDto: CreateUserDto): Promise<User> {
    // If User role is Admin throw unauthorized exception
    if (createUserDto.role === UserRole.ADMIN) {
      throw new UnauthorizedException();
    }
    return this.usersService.create(createUserDto);
  }

  public async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    // If User role is not Admin throw unauthorized exception
    if (createUserDto.role !== UserRole.ADMIN) {
      throw new BadRequestException();
    }
    return this.usersService.create(createUserDto);
  }

  public async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  public async getUser(id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  public async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<any> {
    return this.usersService.update(id, updateUserDto);
  }

  // Delete a user
  public async deleteUser(id: string): Promise<any> {
    return this.usersService.remove(id);
  }
}
