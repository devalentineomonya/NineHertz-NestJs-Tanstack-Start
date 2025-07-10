import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersFilterDto } from './dto/find-users-filter.dto';

type ProfileData = {
  id: string;
  fullName: string;
  adminType?: string;
  specialty?: string;
} | null;
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: createUserDto.password,
    });

    const savedUser = await this.userRepository.save(user);
    delete savedUser.passwordHash;
    return savedUser;
  }

  async findAll(filterDto?: FindUsersFilterDto): Promise<
    Array<
      User & {
        profile: {
          fullName: string;
          adminType?: string;
          specialty?: string;
        } | null;
      }
    >
  > {
    // Create query with relations
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.patientProfile', 'patientProfile')
      .leftJoinAndSelect('user.doctorProfile', 'doctorProfile')
      .leftJoinAndSelect('user.adminProfile', 'adminProfile')
      .leftJoinAndSelect('user.pharmacistProfile', 'pharmacistProfile');

    // Apply filters
    if (filterDto) {
      const { role, email, isEmailVerified, search } = filterDto;

      if (role) {
        query.andWhere('user.role = :role', { role });
      }

      if (email) {
        query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
      }

      if (isEmailVerified !== undefined) {
        query.andWhere('user.isEmailVerified = :isEmailVerified', {
          isEmailVerified,
        });
      }

      if (search) {
        query.andWhere(
          '(user.email ILIKE :search OR user.id::text ILIKE :search)',
          { search: `%${search}%` },
        );
      }
    }

    // Get users with profiles
    const users = await query.getMany();

    // Transform each user to include profile field
    return users.map((user) => {
      let profileData: ProfileData = null;

      switch (user.role as UserRole) {
        case UserRole.PATIENT:
          profileData = user.patientProfile
            ? {
                fullName: user.patientProfile.fullName,
                id: user.patientProfile.id,
              }
            : null;
          break;
        case UserRole.ADMIN:
          profileData = user.adminProfile
            ? {
                fullName: user.adminProfile.fullName,
                adminType: user.adminProfile.adminType,
                id: user.adminProfile.id,
              }
            : null;
          break;
        case UserRole.DOCTOR:
          profileData = user.doctorProfile
            ? {
                fullName: user.doctorProfile.fullName,
                specialty: user.doctorProfile.specialty,
                id: user.doctorProfile.id,
              }
            : null;
          break;
        case UserRole.PHARMACIST:
          profileData = user.pharmacistProfile
            ? {
                fullName: user.pharmacistProfile.fullName,
                id: user.pharmacistProfile.id,
              }
            : null;
          break;
      }

      // Remove profile relations from base user object
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        patientProfile,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        doctorProfile,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        adminProfile,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pharmacistProfile,
        ...userData
      } = user;
      return {
        ...userData,
        profile: profileData,
      } as User & {
        profile: {
          fullName: string;
          adminType?: string;
          specialty?: string;
        } | null;
      };
    });
  }
  async findOne(id: string): Promise<
    User & {
      profile: {
        fullName: string;
        adminType?: string;
        specialty?: string;
      } | null;
    }
  > {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'patientProfile',
        'doctorProfile',
        'adminProfile',
        'pharmacistProfile',
      ],
    });
    console.log(user);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    let profileData: ProfileData = null;
    switch (user.role as UserRole) {
      case UserRole.PATIENT:
        profileData = user.patientProfile
          ? {
              fullName: user.patientProfile.fullName,
              id: user.patientProfile.id,
            }
          : null;
        break;
      case UserRole.ADMIN:
        profileData = user.adminProfile
          ? {
              fullName: user.adminProfile.fullName,
              adminType: user.adminProfile.adminType,
              id: user.adminProfile.id,
            }
          : null;
        break;
      case UserRole.DOCTOR:
        profileData = user.doctorProfile
          ? {
              fullName: user.doctorProfile.fullName,
              specialty: user.doctorProfile.specialty,
              id: user.doctorProfile.id,
            }
          : null;
        break;
      case UserRole.PHARMACIST:
        profileData = user.pharmacistProfile
          ? {
              fullName: user.pharmacistProfile.fullName,
              id: user.pharmacistProfile.id,
            }
          : null;
        break;
    }

    // Remove profile relations from base user object
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      patientProfile,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      doctorProfile,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      adminProfile,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      pharmacistProfile,
      ...userData
    } = user;

    return {
      ...(userData as User),

      profile: profileData,
    } as User & {
      profile: {
        fullName: string;
        adminType?: string;
        specialty?: string;
      } | null;
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Handle password update
    if (updateUserDto.password) {
      user.passwordHash = updateUserDto.password;
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    delete updatedUser.passwordHash;
    return updatedUser;
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.passwordHash = newPassword;
    await this.userRepository.save(user);
  }

  async updateEmail(id: string, newEmail: string): Promise<User> {
    const user = await this.findOne(id);
    user.email = newEmail;
    return this.userRepository.save(user);
  }

  async save(user: User): Promise<User> {
    const savedUser = await this.userRepository.save(user);
    delete savedUser.passwordHash;
    return savedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
