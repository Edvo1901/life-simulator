import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  ValidateIf,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export class CredentialsDto {
  @IsString() @Length(1, 50) username!: string;
  @IsString() @Length(8, 72) password!: string;
}
export class AccountListDto {
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(200) pageSize = 50;
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(50)
  search = '';
}
export class RowVersionDto {
  @IsString() @Matches(/^[0-9a-f]{16}$/) rowVer!: string;
}
export class AccountUpdateDto extends RowVersionDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['user', 'admin'])
  roleCode?: string;
  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  enabled?: boolean;
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Length(8, 72)
  password?: string;
}
