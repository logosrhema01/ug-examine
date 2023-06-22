import { ConflictException, Injectable } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly _staffRepository: Repository<Staff>,
  ) {}
  async create(createStaffDto: CreateStaffDto) {
    const staffExists = await this._staffRepository.findOneBy({
      id: createStaffDto.id,
    });
    if (staffExists) {
      throw new ConflictException('Staff already exists');
    }
    const staff = this._staffRepository.create(createStaffDto);
    return await this._staffRepository.save(staff);
  }

  findAll() {
    return this._staffRepository.find();
  }

  findOne(id: string) {
    return this._staffRepository.findOneBy({ id });
  }

  update(id: string, updateStaffDto: UpdateStaffDto) {
    return this._staffRepository.update({ id }, updateStaffDto);
  }

  remove(id: string) {
    return this._staffRepository.delete({ id });
  }
}
