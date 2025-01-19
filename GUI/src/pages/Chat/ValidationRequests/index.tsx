import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PaginationState,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import * as Tabs from '@radix-ui/react-tabs';
import { format } from 'date-fns';
import { AiFillCheckCircle } from 'react-icons/ai';
import {
  Button,
  Card,
  Chat,
  DataTable,
  Dialog,
  Drawer,
  FormRadios,
  HistoricalChat,
  Icon,
  Tooltip,
  Track,
} from 'components';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Message } from 'types/message';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import { AxiosError } from 'axios';
import { userStore as useHeaderStore } from '@buerokratt-ria/header';
import MessageContentView from './MessageContentView';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { CHAT_EVENTS, CHAT_STATUS, Chat as ChatType } from 'types/chat';
import './ValidationRequests.scss';
import clsx from 'clsx';
import { userInfo } from 'os';
import useStore from 'store';
import { v4 as uuidv4 } from 'uuid';
import ChatTrigger from '../ChatActive/ChatTrigger';
import ForwardToColleaugeModal from '../ForwardToColleaugeModal';
import ForwardToEstablishmentModal from '../ForwardToEstablishmentModal';
import { User } from 'types/user';

const ValidationRequests: React.FC = () => {
  const { t } = useTranslation();
  const selectedChatId = useHeaderStore((state) => state.selectedChatId);
  const selectedChat = useHeaderStore((state) => state.selectedValidationChat());

  const loadValidationRequests = useHeaderStore((state) => state.loadValidationChats);

  useEffect(() => {
    useHeaderStore.getState().loadValidationChats();
  }, []);

  const { data: csaNameVisiblity } = useQuery<{ isVisible: boolean }>({
    queryKey: ['agents/admin/name-visibility', 'prod'],
  });

  const { data: csaTitleVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['agents/admin/title-visibility', 'prod'],
  });

  const validationChats = useHeaderStore((state) =>
    state.getValidationChats()
  );

  useEffect(() => {
    console.log('selectedChatId', selectedChat);
  }, [selectedChatId]);

  return (
    <Tabs.Root
      className="vertical-tabs"
      orientation="vertical"
      onValueChange={useHeaderStore.getState().setSelectedChatId}
      style={{ height: '100%', overflow: 'hidden' }}
    >
      <Tabs.List
        className="vertical-tabs__list"
        aria-label={t('chat.active.list') ?? ''}
        style={{ overflow: 'auto' }}
      >
        <div className="vertical-tabs__group-header">
          <p>{`${t('chat.validations.title')} ${
            (validationChats?.length ?? 0) == 0
              ? ''
              : `(${validationChats?.length ?? 0})`
          }`}</p>
        </div>
        {validationChats?.map((chat) => (
          <Tabs.Trigger
            key={chat.id}
            className={clsx('vertical-tabs__trigger')}
            value={chat.id}
            style={{ borderBottom: '1px solid #D2D3D8' }}
          >
            <ChatTrigger chat={chat} />
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {selectedChatId ? (
        <Tabs.Content className="vertical-tabs__body" value={selectedChatId}>
          {selectedChat && (
            <Chat
              chat={selectedChat}
              isCsaNameVisible={csaNameVisiblity?.isVisible ?? false}
              isCsaTitleVisible={csaTitleVisibility?.isVisible ?? false}
              onChatEnd={() => {}}
              onForwardToColleauge={() => {}}
              onForwardToEstablishment={() => {}}
              onSendToEmail={() => {}} // To be added when endpoint is ready
              onRefresh={loadValidationRequests}
            />
          )}
        </Tabs.Content>
      ) : (
        <div className="vertical-tabs__body-placeholder">
          <p className="h3" style={{ color: '#9799A4' }}>
            {t('chat.active.chooseChat')}
          </p>
        </div>
      )}
    </Tabs.Root>
  );
};

export default withAuthorization(ValidationRequests, [
  ROLES.ROLE_ADMINISTRATOR,
  ROLES.ROLE_CUSTOMER_SUPPORT_AGENT,
]);
