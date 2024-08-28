import { FC, useState } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import { Button, Card, FormTextarea, Switch, Track } from 'components';
import { WELCOME_MESSAGE_LENGTH } from 'constants/config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';

const SettingsWelcomeMessage: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [welcomeMessageActive, setWelcomeMessageActive] = useState<
    boolean | undefined
  >(undefined);
  useQuery({
    queryKey: ['greeting/message', 'prod'],
    onSuccess: (res: any) => {
      setWelcomeMessage(res.response.est ?? '');
      setWelcomeMessageActive(res.response.isActive ?? false);
    },
  });

  const welcomeMessageMutation = useMutation({
    mutationFn: () =>
      apiDev.post('greeting/message', {
        message: welcomeMessage,
      }),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('settings.welcomeMessage.messageChanged'),
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

  const messageActivityMutation = useMutation({
    mutationFn: (value: boolean) =>
      apiDev.post('greeting/is-active', {
        isActive: value,
      }),
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const handleFormSubmit = () => {
    if (welcomeMessage.length === 0) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.welcomeMessage.emptyMessage'),
      });
    } else {
      messageActivityMutation.mutate(welcomeMessageActive ?? true);
      welcomeMessageMutation.mutate();
    }
  };

  if (welcomeMessageActive === undefined) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>{t('settings.welcomeMessage.welcomeMessage')}</h1>
      <p>{t('settings.welcomeMessage.description')}</p>
      <Card
        footer={
          <Track justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={16} direction="vertical" align="left">
          <Switch
            checked={welcomeMessageActive}
            label={t('settings.welcomeMessage.greetingActive')}
            name={'label'}
            onCheckedChange={setWelcomeMessageActive}
          />
          <FormTextarea
            label={t('settings.welcomeMessage.welcomeMessage')}
            minRows={4}
            maxLength={WELCOME_MESSAGE_LENGTH}
            showMaxLength
            maxLengthBottom
            onChange={(e) => setWelcomeMessage(e.target.value)}
            value={welcomeMessage}
            name="label"
          />
        </Track>
      </Card>
    </>
  );
};

export default withAuthorization(SettingsWelcomeMessage, [ROLES.ROLE_ADMINISTRATOR]);
