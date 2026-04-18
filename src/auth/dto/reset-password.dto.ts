import { Transform } from 'class-transformer';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsUUID()
  token: string;

  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value.trim())
  newPassword: string;
}
