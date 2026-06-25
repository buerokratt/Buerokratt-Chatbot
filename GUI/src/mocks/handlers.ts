import { rest } from 'msw';

import { healthzStatusData } from './healthzStatus';
import { usersData } from './users';

const BASE_URL = import.meta.env.BASE_URL;

export const handlers = [
  rest.get(BASE_URL + 'accounts/admins', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(usersData));
  }),
  rest.get(BASE_URL + 'health/components-status', (req, res, ctx) => {
    return res(ctx.json(healthzStatusData));
  }),
  rest.post(BASE_URL + 'attachments/add', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
];
