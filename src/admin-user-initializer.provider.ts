import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';

@Injectable()
export class AdminUserInitializer implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    const {
      ADMIN_USERNAME,
      ADMIN_PASSWORD,
      ADMIN_EMAIL,
      ADMIN_PHONE,
      ADMIN_FULLNAME,
    } = process.env;
    const user = await this.usersService.findOne(ADMIN_USERNAME);
    if (!user) {
      await this.usersService.create({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        role: UserRole.ADMIN,
        email: ADMIN_EMAIL,
        phoneNumber: ADMIN_PHONE,
        fullName: ADMIN_FULLNAME,
      });
      console.log('Admin User Created Successfully');
    }
  }
}
