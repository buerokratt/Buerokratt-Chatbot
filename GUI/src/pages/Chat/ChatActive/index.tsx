import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';

import useGetActiveChats from 'hooks/useGetActiveChats';

const ChatActive: FC = () => {
  const { t } = useTranslation();
  const { activeChats } = useGetActiveChats();

  const handleTabsValueChange = useCallback(
    (value: string) => {
    },
    [],
  );

  return (
    <Tabs.Root
      className='vertical-tabs'
      orientation='vertical'
      onValueChange={handleTabsValueChange}
    >
      <Tabs.List
        className="vertical-tabs__list"
        aria-label={t('chat.active.list') || ''}
      >

      </Tabs.List>
    </Tabs.Root>
  );
};

export default ChatActive;
