import { Injectable } from "@nestjs/common";
import { MongoUserRepository } from "src/auth/infrastructure/repositories/mongo-user.repository";
import * as bcrypt from 'bcrypt';


export interface ResetInput {
    token: string;
    newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
    constructor(
        private readonly userRepository: MongoUserRepository,
    ){}

    async execute(input: ResetInput): Promise<void> {
        const user = await this.userRepository.findByResetToken(input.token);
        if (!user) throw new Error('Invalid or expired reset token');

        if (!user.resetTokenExpiry || Date.now() > user.resetTokenExpiry.getTime()) {
            await this.userRepository.update(user.id!, { resetToken: undefined, resetTokenExpiry: undefined });
            throw new Error('The reset token expired');
        }

        const hashedPassword = await bcrypt.hash(input.newPassword, 10);

        await this.userRepository.update(user.id!, {
            password: hashedPassword,
            resetToken: undefined,
            resetTokenExpiry: undefined,
        });
    }


}