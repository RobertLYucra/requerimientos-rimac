import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginUserRequestDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}