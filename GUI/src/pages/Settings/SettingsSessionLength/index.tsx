import { FC, useState } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { Button, Card, FormInput, Track } from 'components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import './SettingsSessionLength.scss';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { Controller, useForm } from 'react-hook-form';

type FormValues = {
  sessionLength: string;
  chatDuration: string;
};

const SettingsSessionLength: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      sessionLength: '',
      chatDuration: '',
    },
  });

  const sessionLength = watch('sessionLength');
  const chatDuration = watch('chatDuration');

  useQuery({
    queryKey: ['accounts/admin/session-length', 'prod'],
    onSuccess: (res: any) => {
      setValue('sessionLength', res.response ?? '');
    },
  });

  const sessionLengthMutation = useMutation({
    mutationFn: () =>
      apiDev.post('accounts/admin/session-length', {
        sessionLength: sessionLength,
      }),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('settings.userSession.sessionChanged'),
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

  const onSubmit = (data: FormValues) => {
    const value = parseInt(data.sessionLength);
    if (!data.sessionLength) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.userSession.emptySession'),
      });
    } else if (value < 30 || value > 480) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.userSession.invalidSession'),
      });
    } else {
      sessionLengthMutation.mutate();
    }
  };

  return (
    <>
      <h1>{t('settings.userSession.sessionLength')}</h1>
      <Card
        isBodyDivided={true}
        footer={
          <Track justify="end">
            <Button onClick={handleSubmit(onSubmit)}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={16} direction="vertical" align="left">
          <p>{t('settings.userSession.description')}</p>
          <Track>
            <Controller
              name="sessionLength"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelWidth={130}
                  name="session-length"
                  label={t('settings.userSession.sessionLength')}
                  type="number"
                />
              )}
            />
            <label className="minute">{t('settings.userSession.minutes')}</label>
          </Track>
          <label className="rule">{t('settings.userSession.rule')}</label>
        </Track>

        <Track gap={16} direction="vertical" align="left">
          <p>{t('settings.chatDuration.description')}</p>
          <Track>
            <Controller
              name="chatDuration"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelWidth={130}
                  name="chatDuration"
                  label={t('settings.chatDuration.duration')}
                  type="number"
                />
              )}
            />
            <label className="minute">{t('settings.chatDuration.minutes')}</label>
          </Track>
          <label className="rule">{t('settings.chatDuration.rule')}</label>
        </Track>
      </Card>
    </>
  );
};

export default withAuthorization(SettingsSessionLength, [ROLES.ROLE_ADMINISTRATOR]);
