import { rest } from 'msw';

import { mainNavigationET } from './mainNavigation';
import { endedChatsData } from './endedChats';
import { chatMessagesData } from './chatMessages';
import { usersData } from './users';
import { userInfoData } from './userInfo';
import { userProfileSettingsData } from './userProfileSettings';
import { activeChatsData } from './activeChats';
import { activeChatMessages } from './activeChatMessages';
import { Chat } from '../types/chat';
import { Message } from '../types/message';

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
  rest.get(import.meta.env.BASE_URL + 'cs-get-organization-working-time', (req, res, ctx) => {
    return res(ctx.json({
      organizationWorkingTimeStartISO: new Date(),
      organizationWorkingTimeEndISO: new Date(),
    }));
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-session-length', (req, res, ctx) => {
    return res(ctx.json({
      id: 28,
      key: 'session_length',
      value: '480',
      deleted: false,
      created: '2023-01-18T12:15:41.385+00:00',
    }));
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-custom-jwt-userinfo', (req, res, ctx) => {
    return res(ctx.json(userInfoData));
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-user-profile-settings', (req, res, ctx) => {
    return res(ctx.json(userProfileSettingsData));
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-all-active-chats', (req, res, ctx) => {
    return res(ctx.json(activeChatsData));
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-customer-support-activity', (req, res, ctx) => {
    return res(ctx.json({
      idCode: 'EE49902216518',
      active: 'true',
      status: 'idle',
    }));
  }),
  rest.get(import.meta.env.BASE_URL + 'cs-get-messages-by-chat-id/:id', (req, res, ctx) => {
    const requestedChatMessages = (activeChatMessages as Record<string, Message[]>)[String(req.params.id)];
    return res(ctx.json(requestedChatMessages));
  }),
];
