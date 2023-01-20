import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Button, Card, FormInput, Track } from 'components';
import { Session } from 'types/session';
import { useToast } from 'hooks/useToast';
import api from 'services/api';

const SettingsUserSession: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { register, handleSubmit, reset } = useForm<{ value: string }>();
  const { data: sessionData } = useQuery<Session>({
    queryKey: ['cs-get-session-length'],
    onSuccess: (data) => reset({ value: data.value }),
  });

  const sessionDataMutation = useMutation({
    mutationFn: (data: Session) => api.post('cs-get-session-length', data),
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    if (!sessionData) return;
    sessionDataMutation.mutate({ ...sessionData, value: data.value });
  });

  return (
    <>
      <h1>{t('settings.userSession.title')}</h1>

      <Card
        footer={
          <Track justify='end'>
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <FormInput {...register('value')} label={t('settings.userSession.sessionLength')} />
      </Card>
    </>
  );
};

export default SettingsUserSession;
