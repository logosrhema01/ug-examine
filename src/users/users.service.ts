import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { NotifyService } from 'src/timetable/notify.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notifyService: NotifyService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    console.log("🚀 ~ file: users.service.ts:18 ~ UsersService ~ create ~ createUserDto:", createUserDto)
    const userExists = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (userExists) {
      throw new ConflictException();
    }
    // Hash the password
    const saltOrRounds = 10;

    const hashedPassword = bcrypt.hashSync(
      createUserDto.password,
      saltOrRounds,
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async createForAndNotify(createUserDto: CreateUserDto) {
    const password = this.generateRandomPassword(8);
    createUserDto.password = password;
    const user = await this.create(createUserDto);

    this.notifyService.accountCreatedFor(user, password);

    return user;
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(username: string) {
    return this.usersRepository.findOne({ where: { username } });
  }

  update(username: string, updateUserDto: UpdateUserDto) {
    // Update User data in repository
    return this.usersRepository.update({ username }, updateUserDto);
  }

  remove(username: string) {
    return this.usersRepository.delete({ username });
  }

  async signIn(username: string, pass: string) {
    // Fetch User from repository, select only the password field
    const user = await this.usersRepository.findOne({
      where: { username },
      select: ['password'],
    });

    // If user not found, throw not found error
    if (!user) {
      throw new Error('User not found');
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(pass, user.password);

    // If password is incorrect, throw unauthorized error
    if (!isPasswordCorrect) {
      throw new Error('Incorrect password');
    }
    return this.findOne(username);
  }

  async findAssignee(staffId: string) {
    const users = await this.usersRepository.find({
      where: { role: UserRole.STAFF, username: staffId },
    });

    if (!users) {
      // Assign to admin if no staff found
      return this.usersRepository.findOne({
        where: { role: UserRole.ADMIN },
      });
    }

    return users[0];
  }

  private generateRandomPassword(length) {
    const characters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[{]};:,<.>/?';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }

    return password;
  }
}
