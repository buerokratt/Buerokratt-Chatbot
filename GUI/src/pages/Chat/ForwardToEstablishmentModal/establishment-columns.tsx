import { createColumnHelper } from '@tanstack/react-table';
import { Button, Icon } from 'components';
import { MdOutlineArrowForward } from 'react-icons/md';
import { Chat } from 'types/chat';
import { Establishment } from 'types/establishment';

export const createEstablishmentColumns = (
  chat: Chat,
  onForward: (chat: Chat, establishment: string) => void,
  t: (key: string) => string,
) => {
  const columnHelper = createColumnHelper<Establishment>();

  const forwardView = (props: { row: { original: Establishment } }) => (
    <Button appearance="text" onClick={() => onForward(chat, props.row.original.name)}>
      <Icon icon={<MdOutlineArrowForward color="rgba(0, 0, 0, 0.54)" />} />
      {t('global.forward')}
    </Button>
  );

  return [
    columnHelper.accessor('name', {
      header: t('chat.active.establishment') ?? '',
      cell: (props) => props.getValue(),
    }),
    columnHelper.display({
      id: 'forward',
      cell: forwardView,
      meta: {
        size: '10%',
      },
    }),
  ];
};
