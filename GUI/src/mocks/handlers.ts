import { rest } from 'msw';

import { mainNavigationET } from './mainNavigation';
import { endedChatsData } from './endedChats';
import { chatMessagesData } from './chatMessages';
import { usersData } from './users';

export const handlers = [
  rest.get(import.meta.env.BASE_URL + 'main-navigation', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: mainNavigationET,
      }),
    );
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-all-ended-chats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(endedChatsData),
    );
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-messages-by-chat-id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(chatMessagesData),
    );
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-admins', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(usersData),
    );
  }),
];
