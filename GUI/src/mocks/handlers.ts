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
  rest.get(import.meta.env.BASE_URL + 'cs-get-is-bot-active', (req, res, ctx) => {
    return res(ctx.json({ is_bot_active: true }));
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-csa-name-visibility', (req, res, ctx) => {
    return res(ctx.json({ isVisible: true }));
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-csa-title-visibility', (req, res, ctx) => {
    return res(ctx.json({ isVisible: false }));
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-emergency-notice', (req, res, ctx) => {
    return res(ctx.json({
      emergencyNoticeText: 'Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean lacinia bibendum nulla sed consectetur.',
      emergencyNoticeStartISO: new Date().toISOString(),
      emergencyNoticeEndISO: new Date().toISOString(),
      isEmergencyNoticeVisible: true,
    }));
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-widget-config', (req, res, ctx) => {
    return res(ctx.json({
      widgetProactiveSeconds: 3,
      widgetDisplayBubbleMessageSeconds: 5,
      widgetBubbleMessageText: 'Küsi minult!',
      widgetColor: '#E99B03',
      isWidgetActive: true,
    }));
  }),
];
