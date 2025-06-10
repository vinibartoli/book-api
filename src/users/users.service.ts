import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { UpdatePasswordUserDto } from './dto/update-password-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const userExist = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (userExist) {
      throw new ConflictException('Email já cadastrado!');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      },
    });

    return user;
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { email, ...rest } = updateUserDto;
    if (email) {
      const userExist = await this.prisma.user.findUnique({
        where: {
          email: updateUserDto.email,
        },
      });

      if (userExist) {
        throw new Error('Email ja cadastrado');
      }
    }

    const userUpdated = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        email,
        ...rest,
      },
    });

    return userUpdated;
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new ConflictException('Usuario não encontrado');
    }

    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      message: `Usuario ${user.name} deletado com sucesso`,
    };
  }

  async hashPassword(password: string) {
    return await argon2.hash(password);
  }

  async updatePassword(
    id: number,
    updatePasswordUserDto: UpdatePasswordUserDto,
  ) {
    const { password } = updatePasswordUserDto;

    const hashedPassword = await this.hashPassword(password);

    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return user;
  }
}
