import { rest } from 'msw';

import { Message } from 'types/message';
import { mainNavigationET } from './mainNavigation';
import { endedChatsData } from './endedChats';
import { chatMessagesData } from './chatMessages';
import { usersData } from './users';
import { userInfoData } from './userInfo';
import { userProfileSettingsData } from './userProfileSettings';
import { activeChatsData } from './activeChats';
import { activeChatMessages } from './activeChatMessages';
import { healthzStatusData } from './healthzStatus';
import { customerSupportAgentsData } from './customerSupportAgents';
import { establishmentsData } from './establishments';

const BASE_URL = import.meta.env.BASE_URL;
export const handlers = [
  rest.get(BASE_URL + 'main-navigation', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: mainNavigationET,
      }),
    );
  }),
  rest.get(BASE_URL + 'cs-get-all-ended-chats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(endedChatsData),
    );
  }),
  rest.get(BASE_URL + 'cs-get-messages-by-chat-id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(chatMessagesData),
    );
  }),
  rest.get(BASE_URL + 'cs-get-admins', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(usersData),
    );
  }),
  rest.get(BASE_URL + 'cs-get-is-bot-active', (req, res, ctx) => {
    return res(ctx.json({ is_bot_active: true }));
  }),
  rest.get(BASE_URL + 'cs-get-csa-name-visibility', (req, res, ctx) => {
    return res(ctx.json({ isVisible: true }));
  }),
  rest.get(BASE_URL + 'cs-get-csa-title-visibility', (req, res, ctx) => {
    return res(ctx.json({ isVisible: false }));
  }),
  rest.get(BASE_URL + 'cs-get-emergency-notice', (req, res, ctx) => {
    return res(ctx.json({
      emergencyNoticeText: 'Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean lacinia bibendum nulla sed consectetur.',
      emergencyNoticeStartISO: new Date().toISOString(),
      emergencyNoticeEndISO: new Date().toISOString(),
      isEmergencyNoticeVisible: true,
    }));
  }),
  rest.get(BASE_URL + 'cs-get-widget-config', (req, res, ctx) => {
    return res(ctx.json({
      widgetProactiveSeconds: 3,
      widgetDisplayBubbleMessageSeconds: 5,
      widgetBubbleMessageText: 'Küsi minult!',
      widgetColor: '#E99B03',
      isWidgetActive: true,
    }));
  }),
  rest.get(BASE_URL + 'cs-get-organization-working-time', (req, res, ctx) => {
    return res(ctx.json({
      organizationWorkingTimeStartISO: new Date(),
      organizationWorkingTimeEndISO: new Date(),
    }));
  }),
  rest.get(BASE_URL + 'cs-get-session-length', (req, res, ctx) => {
    return res(ctx.json({
      id: 28,
      key: 'session_length',
      value: '480',
      deleted: false,
      created: '2023-01-18T12:15:41.385+00:00',
    }));
  }),
  rest.get(BASE_URL + 'cs-custom-jwt-userinfo', (req, res, ctx) => {
    return res(ctx.json(userInfoData));
  }),
  rest.get(BASE_URL + 'cs-get-user-profile-settings', (req, res, ctx) => {
    return res(ctx.json(userProfileSettingsData));
  }),
  rest.get(BASE_URL + 'cs-get-all-active-chats', (req, res, ctx) => {
    return res(ctx.json(activeChatsData));
  }),
  rest.get(BASE_URL + 'cs-get-customer-support-activity', (req, res, ctx) => {
    return res(ctx.json({
      idCode: 'EE49902216518',
      active: 'true',
      status: 'idle',
    }));
  }),
  rest.get(BASE_URL + 'cs-get-messages-by-chat-id/:id', (req, res, ctx) => {
    const requestedChatMessages = (activeChatMessages as Record<string, Message[]>)[String(req.params.id)];
    return res(ctx.json(requestedChatMessages));
  }),
  rest.get(BASE_URL + 'cs-get-components-healthz-status', (req, res, ctx) => {
    return res(ctx.json(healthzStatusData));
  }),
  rest.get(BASE_URL + 'cs-get-customer-support-agents', (req, res, ctx) => {
    return res(ctx.json(customerSupportAgentsData));
  }),
  rest.get(BASE_URL + 'cs-get-all-establishments', (req, res, ctx) => {
    return res(ctx.json(establishmentsData));
  }),

  // rest.post(BASE_URL + '', (req, res, ctx) => {}), // TODO add send chat message here
  rest.post(BASE_URL + 'attachments/add', (req, res, ctx) => {
    return res(ctx.status(400));
  })

];
