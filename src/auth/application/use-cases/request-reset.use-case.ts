import { Injectable } from "@nestjs/common";
import { MongoUserRepository } from "src/auth/infrastructure/repositories/mongo-user.repository";

export interface RequestInput {
    email: string;
}

@Injectable()
export class RequestResetUseCase {
    constructor(
        private readonly userRepository: MongoUserRepository,
    ){}

    async execute(input: RequestInput): Promise<void>{
        const user = await this.userRepository.findByEmail(input.email);
        if(!user) throw new Error(`User with email ${input.email} was not found`);

        const resetToken = crypto.randomUUID();
        const resetTokenExpiry = new Date(Date.now() + 15 * 60000);

        await this.userRepository.update(user.id!, { resetToken, resetTokenExpiry });
    }
}