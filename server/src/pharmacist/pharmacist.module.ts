import { Module } from '@nestjs/common';
import { PharmacistService } from './pharmacist.service';
import { PharmacistController } from './pharmacist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pharmacist } from './entities/pharmacist.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Pharmacist])],
  controllers: [PharmacistController],
  providers: [PharmacistService],
})
export class PharmacistModule {}
