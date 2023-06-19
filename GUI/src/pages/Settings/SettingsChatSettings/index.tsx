import { FC, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';

import { Card, Switch, Track } from 'components';
import { useToast } from 'hooks/useToast';
import apiDev from 'services/api-dev';
import apiDevV2 from 'services/api-dev-v2';

const SettingsChatSettings: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [botActive, setBotActive] = useState<boolean>(true);
  const [isNameVisible, setIsNameVisible] = useState<boolean>(true);
  const [isTitleVisible, setIsTitleVisible] = useState<boolean>(true);
  const { data: botConfig } = useQuery<{ is_bot_active: boolean }>({
    queryKey: ['cs-get-is-bot-active', 'prod'],
    onSuccess(res: any) {
      setBotActive(res.data.get_is_bot_active.value === 'true' ? true : false);
    },
  });
  const { data: csaNameVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['cs-get-csa-name-visibility', 'prod-2'],
    onSuccess(res: any) {
      setIsNameVisible(res.isVisible)
    },
  });
  const { data: csaTitleVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['cs-get-csa-title-visibility', 'prod-2'],
    onSuccess(res: any) {
      setIsTitleVisible(res.isVisible)
    },
  });

  const botConfigMutation = useMutation({
    mutationFn: (data: { is_bot_active: boolean }) => {
      setBotActive(data.is_bot_active);
      return apiDev.post(`cs-set-is-bot-active`, { 'isActive': data.is_bot_active })
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const csaNameVisibilityMutation = useMutation({
    mutationFn: (data: { isVisible: boolean }) => {
      setIsNameVisible(data.isVisible);
      return apiDevV2.post(`cs-set-csa-name-visibility`, data)},
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const csaTitleVisibilityMutation = useMutation({
    mutationFn: (data: { isVisible: boolean }) => {
      setIsTitleVisible(data.isVisible);
      return apiDevV2.post(`cs-set-csa-title-visibility`, data)},
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  return (
    <>
      <h1>{t('settings.title')}</h1>

      <Card
        header={botConfig && (
          <Switch
            name='is_bot_active'
            label={t('settings.chat.chatActive')}
            checked={botActive}
            onCheckedChange={(value) => botConfigMutation.mutate({ is_bot_active: value })
            }
          />
        )}
      >
        <Track gap={8} direction='vertical' align='left'>
          {csaNameVisibility && (
            <Switch
              name='is_csa_name_visible'
              label={t('settings.chat.showSupportName')}
              checked={isNameVisible}
              onCheckedChange={(value) => csaNameVisibilityMutation.mutate({ isVisible: value })}
            />
          )}
          {csaTitleVisibility && (
            <Switch
              name='is_csa_title_visible'
              label={t('settings.chat.showSupportTitle')}
              checked={isTitleVisible}
              onCheckedChange={(value) => csaTitleVisibilityMutation.mutate({ isVisible: value })}
            />
          )}
        </Track>
      </Card>
    </>
  );
};

export default SettingsChatSettings;
