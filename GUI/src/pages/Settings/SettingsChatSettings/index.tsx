import { FC, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';

import { Button, Card, Switch, Track } from 'components';
import { useToast } from 'hooks/useToast';
import apiDev from 'services/api-dev';

const SettingsChatSettings: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [botActive, setBotActive] = useState<boolean | undefined>(undefined);
  const [isNameVisible, setIsNameVisible] = useState<boolean | undefined>(
    undefined
  );
  const [isTitleVisible, setIsTitleVisible] = useState<boolean | undefined>(
    undefined
  );
  const { data: botConfig } = useQuery<{ is_bot_active: boolean }>({
    queryKey: ['bots/config/active', 'prod'],
    onSuccess(res: any) {
      setBotActive(res.response === 'true');
    },
  });
  const { data: csaNameVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['agents/name-visibility', 'prod'],
    onSuccess(res: any) {
      setIsNameVisible(res.response);
    },
  });
  const { data: csaTitleVisibility } = useQuery<{ isVisible: boolean }>({
    queryKey: ['agents/title-visibility', 'prod'],
    onSuccess(res: any) {
      setIsTitleVisible(res.response);
    },
  });

  const botConfigMutation = useMutation({
    mutationFn: (data: { is_bot_active: boolean }) => {
      setBotActive(data.is_bot_active);
      return apiDev.post(`bots/config/active`, { isActive: data.is_bot_active });
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
      return apiDev.post(`agents/name-visibility`, data);
    },
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
      return apiDev.post(`agents/title-visibility`, data);
    },
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.updateSuccess'),
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const handleFormSubmit = () => {
    botConfigMutation.mutate({ is_bot_active: botActive ?? true });
    csaNameVisibilityMutation.mutate({ isVisible: isNameVisible ?? true });
    csaTitleVisibilityMutation.mutate({ isVisible: isTitleVisible ?? true });
  };

  if (
    botActive === undefined &&
    isNameVisible === undefined &&
    isTitleVisible === undefined
  ) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>{t('settings.title')}</h1>

      <Card
        header={
          botConfig && (
            <Switch
              name="is_bot_active"
              label={t('settings.chat.chatActive')}
              checked={botActive}
              onCheckedChange={setBotActive}
            />
          )
        }
        footer={
          <Track justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={8} direction="vertical" align="left">
          {csaNameVisibility && (
            <Switch
              name="is_csa_name_visible"
              label={t('settings.chat.showSupportName')}
              checked={isNameVisible}
              onCheckedChange={setIsNameVisible}
            />
          )}
          {csaTitleVisibility && (
            <Switch
              name="is_csa_title_visible"
              label={t('settings.chat.showSupportTitle')}
              checked={isTitleVisible}
              onCheckedChange={setIsTitleVisible}
            />
          )}
        </Track>
      </Card>
    </>
  );
};

export default SettingsChatSettings;
