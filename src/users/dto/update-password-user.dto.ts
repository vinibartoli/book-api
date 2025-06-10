import { IsNotEmpty } from 'class-validator';

export class UpdatePasswordUserDto {
  @IsNotEmpty({ message: 'A senha precisa ser informada' })
  password: string;
}
