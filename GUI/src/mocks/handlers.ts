import { rest } from 'msw';

import { mainNavigationET } from './mainNavigation';

export const handlers = [
  rest.get(`${import.meta.env.BASE_URL}api/main-navigation`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: mainNavigationET,
      }),
    );
  }),
];
