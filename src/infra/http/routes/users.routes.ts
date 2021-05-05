import express from 'express';

import { adaptRoute } from '../adapters/ExpressRouter';

import { makeCreateUserControllerFactory } from '@/infra/http/factories/controllers/createUser/CreateUserControllerFactory';
import { makeListUsersControllerFactory } from '@/infra/http/factories/controllers/listUsers/ListUsersControllerFactory';

const usersRouter = express();

usersRouter.get('/', adaptRoute(makeListUsersControllerFactory()));
usersRouter.post('/', adaptRoute(makeCreateUserControllerFactory()));

export { usersRouter };
