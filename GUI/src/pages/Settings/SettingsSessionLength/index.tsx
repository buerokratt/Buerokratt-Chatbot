import { FC } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { Button, Card, FormInput, Switch, Track } from 'components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import './SettingsSessionLength.scss';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { Controller, useForm } from 'react-hook-form';

type FormValues = {
  sessionLength: string;
  chatActiveDuration: string;
  showIdleWarning: boolean;
  autoCloseConversation: boolean;
};

type ConfigItem = {
  id: number;
  key: string;
  value: string;
};

const SettingsSessionLength: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const displayAutoCloseConfigurations = import.meta.env.REACT_APP_SHOW_AUTO_CLOSE_CONFIG.toLowerCase() === 'true';

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      sessionLength: '',
      chatActiveDuration: '',
      showIdleWarning: false,
      autoCloseConversation: true
    },
  });

  const extractConfigMap = (response: ConfigItem[]): Record<string, string> => {
    return response.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);
  };

  const sessionLength = watch('sessionLength');
  const chatActiveDuration = watch('chatActiveDuration');
  const showIdleWarning = watch('showIdleWarning');
  const autoCloseConversation = watch('autoCloseConversation');

  useQuery({
    queryKey: ['accounts/admin/session-length', 'prod'],
    onSuccess: (res: any) => {
      const data = extractConfigMap(res.response);
      setValue('sessionLength', data.session_length ?? '');
      setValue('chatActiveDuration', data.chat_active_duration ?? '');
      setValue('showIdleWarning', data.show_idle_warning?.toLowerCase() === "true");
      setValue('autoCloseConversation', data.auto_close_conversation?.toLowerCase() === "true");
    },
  });

  const sessionLengthMutation = useMutation({
    mutationFn: () =>
      apiDev.post('accounts/admin/session-length', {
        sessionLength: sessionLength,
        chatActiveDuration: chatActiveDuration,
        showIdleWarning: showIdleWarning.toString(),
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

  const valueInRange = (
    inputValue: string,
    minValue: number,
    maxValue: number
  ) => {
    const value = parseInt(inputValue);
    if (!value) {
      return false;
    } else {
      return value < minValue || value > maxValue;
    }
  };

  const onSubmit = (data: FormValues) => {
    if (!data.sessionLength) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.userSession.emptySession'),
      });
    } else if (valueInRange(data.sessionLength, 30, 480)) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.userSession.invalidSession'),
      });
    } else if (valueInRange(data.chatActiveDuration, 5, 480)) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.chatDuration.invalidSession'),
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
            <label className="minute">
              {t('settings.userSession.minutes')}
            </label>
          </Track>
          <label className="rule">{t('settings.userSession.rule')}</label>
        </Track>

        <Track gap={16} direction="vertical" align="left">
          <p>{t('settings.chatDuration.description')}</p>
          <Track>
            <Controller
              name="chatActiveDuration"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  labelWidth={130}
                  name="chatActiveDuration"
                  label={t('settings.chatDuration.duration')}
                  type="number"
                />
              )}
            />
            <label className="minute">
              {t('settings.chatDuration.minutes')}
            </label>
          </Track>
          <Controller
            name="showIdleWarning"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('global.displayText')}
                onLabel={t('global.yes') ?? 'yes'}
                offLabel={t('global.no') ?? 'no'}
                onCheckedChange={(e) => field.onChange(e)}
                checked={field.value}
                {...field}
              />
            )}
          />
          <label className="rule">{t('settings.chatDuration.rule')}</label>
        </Track>
        {displayAutoCloseConfigurations && (
          <Track>
            <Controller
              name="autoCloseConversation"
              control={control}
              render={({ field }) => (
                <Switch
                  label={t('settings.autoClose')}
                  onLabel={t('global.yes') ?? 'yes'}
                  offLabel={t('global.no') ?? 'no'}
                  onCheckedChange={(e) => field.onChange(e)}
                  checked={field.value}
                  {...field}
                />
              )}
            />
          </Track>
        )}
      </Card>
    </>
  );
};

export default withAuthorization(SettingsSessionLength, [
  ROLES.ROLE_ADMINISTRATOR,
]);
