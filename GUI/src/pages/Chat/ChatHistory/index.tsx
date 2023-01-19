import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MdOutlineRemoveRedEye } from 'react-icons/md';

import { Button, Card, DataTable, Drawer, FormInput, HistoricalChat, Icon } from 'components';
import { Chat as ChatType, CHAT_STATUS } from 'types/chat';
import { Message } from 'types/message';

const ChatHistory: FC = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data: endedChats } = useQuery<ChatType[]>({
    queryKey: ['cs-get-all-ended-chats'],
  });
  const { data: chatMessages } = useQuery<Message[]>({
    queryKey: ['cs-get-messages-by-chat-id', selectedChat?.id],
    enabled: !!selectedChat,
  });
  const columnHelper = createColumnHelper<ChatType>();

  const endedChatsColumns = useMemo(() => [
    columnHelper.accessor('created', {
      header: t('chat.history.startTime') || '',
      cell: (props) => format(new Date(props.getValue()), 'd. MMM yyyy HH:ii:ss'),
    }),
    columnHelper.accessor('ended', {
      header: t('chat.history.endTime') || '',
      cell: (props) => format(new Date(props.getValue()), 'd. MMM yyyy HH:ii:ss'),
    }),
    columnHelper.accessor('customerSupportDisplayName', {
      header: t('chat.history.csaName') || '',
    }),
    columnHelper.accessor((row) => `${row.endUserFirstName} ${row.endUserLastName}`, {
      header: t('global.name') || '',
    }),
    columnHelper.accessor('customerSupportId', {
      header: t('global.idCode') || '',
    }),
    columnHelper.accessor('contactsMessage', {
      header: t('chat.history.contact') || '',
      cell: (props) => props.getValue()
        ? t('global.yes')
        : t('global.no'),
    }),
    // columnHelper.accessor('comment', {}),
    // columnHelper.accessor('label', {}),
    // columnHelper.accessor('NPS', {}),
    columnHelper.accessor('status', {
      header: t('global.status') || '',
      cell: (props) => props.getValue() === CHAT_STATUS.ENDED ? t('chat.status.ended') : '',
    }),
    columnHelper.accessor('id', {
      header: 'ID',
    }),
    columnHelper.display({
      id: 'detail',
      cell: (props) => (
        <Button appearance='text' onClick={() => setSelectedChat(props.row.original)}>
          <Icon icon={<MdOutlineRemoveRedEye color={'rgba(0,0,0,0.54)'} />} />
          {t('global.view')}
        </Button>
      ),
      meta: {
        size: '1%',
      },
    }),
  ], []);

  if (!endedChats) return <>Loading...</>;

  return (
    <>
      <h1>{t('chat.history.title')}</h1>

      <Card>
        <FormInput
          label={t('chat.history.searchChats')}
          hideLabel
          name='searchChats'
          placeholder={t('chat.history.searchChats') + '...'}
        />
      </Card>

      <Card>
        <DataTable
          data={endedChats}
          columns={endedChatsColumns}
          globalFilter={filter}
          setGlobalFilter={setFilter}
          pagination={pagination}
          setPagination={setPagination}
        />
      </Card>

      {selectedChat && chatMessages && (
        <Drawer
          title={`${selectedChat.endUserFirstName} ${selectedChat.endUserLastName}`}
          onClose={() => setSelectedChat(null)}
        >
          {/*<HistoricalChat  />*/}
        </Drawer>
      )}
    </>
  );
};

export default ChatHistory;
