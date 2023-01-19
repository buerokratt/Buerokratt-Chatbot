import { FC } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';

import { Card, Switch, Track } from 'components';
import { useToast } from 'hooks/useToast';
import api from 'services/api';

const SettingsChatSettings: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: botConfig } = useQuery<{ is_bot_active: boolean }>({
    queryKey: ['cs-get-is-bot-active'],
  });
  const { data: csaNameVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['cs-get-csa-name-visibility'],
  });
  const { data: csaTitleVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['cs-get-csa-title-visibility'],
  });

  const botConfigMutation = useMutation({
    mutationFn: (data: { is_bot_active: boolean }) => api.post(`cs-set-is-bot-active`, data),
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const csaNameVisibilityMutation = useMutation({
    mutationFn: (data: { isVisible: boolean }) => api.post(`cs-set-csa-name-visibility`, data),
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const csaTitleVisibilityMutation = useMutation({
    mutationFn: (data: { isVisible: boolean }) => api.post(`cs-set-csa-title-visibility`, data),
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
            defaultChecked={botConfig.is_bot_active}
            onCheckedChange={(value) => botConfigMutation.mutate({ is_bot_active: value })}
          />
        )}
      >
        <Track gap={8} direction='vertical' align='left'>
          {csaNameVisibility && (
            <Switch
              name='is_csa_name_visible'
              label={t('settings.chat.showSupportName')}
              defaultChecked={csaNameVisibility.isVisible}
              onCheckedChange={(value) => csaNameVisibilityMutation.mutate({ isVisible: value })}
            />
          )}
          {csaTitleVisibility && (
            <Switch
              name='is_csa_title_visible'
              label={t('settings.chat.showSupportTitle')}
              defaultChecked={csaTitleVisibility.isVisible}
              onCheckedChange={(value) => csaTitleVisibilityMutation.mutate({ isVisible: value })}
            />
          )}
        </Track>
      </Card>
    </>
  );
};

export default SettingsChatSettings;
