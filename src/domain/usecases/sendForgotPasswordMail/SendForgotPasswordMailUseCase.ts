import { join } from 'path';

import { left, right } from '@/shared/logic/Either';

import { UserTokens } from '@/domain/entities/userTokens/userTokens';

import { ISendForgotPasswordMailUseCase } from '@/domain/usecases/sendForgotPasswordMail/ISendForgotPasswordMailUseCase';

import { IUsersRepository } from '@/domain/usecases/_common_/repositories/IUsersRepository';
import { IUsersTokensRepository } from '@/domain/usecases/_common_/repositories/IUsersTokensRepository';

import { IMailProvider } from '@/domain/usecases/_common_/providers/IMailProvider';
import { IDateProvider } from '@/domain/usecases/_common_/providers/IDateProvider';
import { IUUIDProvider } from '@/domain/usecases/_common_/providers/IUUIDProvider';

import { SendForgotPasswordMailRequestDTO } from '@/domain/usecases/sendForgotPasswordMail/dtos/SendForgotPasswordMailRequestDTO';
import { SendForgotPasswordMailResponseDTO } from '@/domain/usecases/sendForgotPasswordMail/dtos/SendForgotPasswordMailResponseDTO';

import { AccountDoesNotExists } from '@/domain/usecases/_common_/errors/AccountDoesNotExists';

class SendForgotPasswordMailUseCase implements ISendForgotPasswordMailUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private usersTokensRepository: IUsersTokensRepository,
    private mailProvider: IMailProvider,
    private dateProvider: IDateProvider,
    private uuidProvider: IUUIDProvider,
  ) {}

  async sendForgotPasswordMail({
    email,
  }: SendForgotPasswordMailRequestDTO): Promise<SendForgotPasswordMailResponseDTO> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      return left(new AccountDoesNotExists());
    }

    const id = this.uuidProvider.generateUUID();
    const token_forgot_password = this.uuidProvider.generateUUID();

    const expires_date = this.dateProvider.addHours(3);

    const userTokenOrError = UserTokens.create(
      {
        user_id: user.id,
        token: token_forgot_password,
        expires_date: expires_date,
        type: 'forgot_password',
      },
      id,
    );

    if (userTokenOrError.isLeft()) {
      return left(userTokenOrError.value);
    }

    const userToken: UserTokens = userTokenOrError.value;

    await this.usersTokensRepository.create({
      id: userToken.id,
      type: userToken.type.value,
      expires_date: userToken.expires_date.value,
      token: userToken.token,
      user_id: userToken.user_id,
    });

    const templatePath = join(
      process.cwd(),
      'src',
      'shared',
      'resources',
      'views',
      'forgotPasswordSendMail.hbs',
    );

    await this.mailProvider.sendMail({
      to: {
        name: user.name,
        email: user.email,
      },
      subject: '[Boilerplate] Recuperação de senha',
      templateData: {
        file: templatePath,
        variables: {
          name: user.name,
          link: `${process.env.APP_WEB_URL}/reset_password?token=${token_forgot_password}`,
        },
      },
    });

    return right(true);
  }
}

export { SendForgotPasswordMailUseCase };
