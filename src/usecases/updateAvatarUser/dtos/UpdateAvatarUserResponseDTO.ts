import { Either } from '@/shared/logic/Either';

import { User } from '@/entities/user/user';

import { AccountDoesNotExists } from '@/usecases/_helpers_/errors/AccountDoesNotExists';

type UpdateAvatarUserResponseDTO = Either<AccountDoesNotExists, User>;

export { UpdateAvatarUserResponseDTO };
