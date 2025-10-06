import { FC } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  FormInput,
  FormTextarea,
  Icon,
  Switch,
  Tooltip,
  Track,
} from 'components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import './SettingsSessionLength.scss';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { Controller, useForm } from 'react-hook-form';
import { WELCOME_MESSAGE_LENGTH } from '../../../constants/config';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { InfoTooltip } from '../../../utils/getToolTipWithText';

type FormValues = {
  sessionLength: string;
  chatActiveDuration: string;
  showIdleWarning: boolean;
  idleMessage: string;
  showAutoCloseText: boolean;
  autoCloseText: string;
};

type ConfigItem = {
  id: number;
  key: string;
  value: string;
};

const SettingsSessionLength: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      sessionLength: '',
      chatActiveDuration: '',
      showIdleWarning: false,
      idleMessage: '',
      showAutoCloseText: false,
      autoCloseText: '',
    },
  });

  const tooltips = {
    sessionLength: t('settings.sessionLength.tooltip.sessionLength'),
    idleTimout: t('settings.sessionLength.tooltip.idleTimout'),
    showIdleMessage: t('settings.sessionLength.tooltip.showIdleMessage'),
    idleMessageText: t('settings.sessionLength.tooltip.idleMessageText'),
    showEndMessage: t('settings.sessionLength.tooltip.showEndMessage'),
    endMessageText: t('settings.sessionLength.tooltip.endMessageText'),
  };

  const getTooltip = (
    name:
      | 'sessionLength'
      | 'idleTimout'
      | 'showIdleMessage'
      | 'idleMessageText'
      | 'showEndMessage'
      | 'endMessageText'
  ) => {
    return (
      <Tooltip content={tooltips[name]}>
        <span>
          <Icon
            icon={<AiOutlineInfoCircle fontSize={20} color="#005aa3" />}
            size="medium"
          />
        </span>
      </Tooltip>
    );
  }

  const extractConfigMap = (response: ConfigItem[]): Record<string, string> => {
    return response.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);
  };

  const [sessionLength, chatActiveDuration, showIdleWarning, idleMessage, showAutoCloseText, autoCloseText] =
    watch([
      'sessionLength',
      'chatActiveDuration',
      'showIdleWarning',
      'idleMessage',
      'showAutoCloseText',
      'autoCloseText'
    ]);

  useQuery({
    queryKey: ['accounts/admin/session-length', 'prod'],
    onSuccess: (res: any) => {
      const data = extractConfigMap(res.response);

      const stringFields = {
        sessionLength: data.session_length,
        chatActiveDuration: data.chat_active_duration,
        autoCloseText: data.auto_close_text,
        idleMessage: data.idle_message
      };

      const booleanFields = {
        showIdleWarning: data.show_idle_warning,
        showAutoCloseText: data.show_auto_close_text
      };

      Object.entries(stringFields).forEach(([key, value]) =>
        setValue(key as keyof FormValues, value ?? '')
      );

      Object.entries(booleanFields).forEach(([key, value]) =>
        setValue(key as keyof FormValues, value?.toLowerCase() === 'true')
      );
    },
  });

  const sessionLengthMutation = useMutation({
    mutationFn: () =>
      apiDev.post('accounts/admin/session-length', {
        sessionLength: sessionLength,
        chatActiveDuration: chatActiveDuration,
        showIdleWarning: showIdleWarning.toString(),
        idleMessage: idleMessage,
        showAutoCloseText: showAutoCloseText.toString(),
        autoCloseText: autoCloseText,
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
        isScrollable={true}
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
            <Track gap={10}>
              <label className="minute">
                {t('settings.userSession.minutes')}
              </label>
              {getTooltip('sessionLength')}
            </Track>
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
            <Track gap={10} >
              <label className="minute">
                {t('settings.chatDuration.minutes')}
              </label>
              {getTooltip('idleTimout')}
            </Track>
          </Track>
          <label className="rule">{t('settings.chatDuration.rule')}</label>


        </Track>
          <Track
            gap={16}
            direction="vertical"
            align="left"
            style={{ paddingRight: '20px' }}
          >
            <Controller
              name="showIdleWarning"
              control={control}
              render={({ field }) => (
                <>
                  <Switch
                    label={t('global.displayText')}
                    onLabel={t('global.yes') ?? 'yes'}
                    offLabel={t('global.no') ?? 'no'}
                    onCheckedChange={(e) => field.onChange(e)}
                    checked={field.value}
                    tooltip={<InfoTooltip name='settings.sessionLength.tooltip.showIdleMessage' />}
                    {...field}
                  />
                  {showIdleWarning && (
                    <Track gap={10} style={{ width: '100%' }}>
                    <Controller
                      name="idleMessage"
                      control={control}
                      render={({ field }) => (
                        <FormTextarea
                          label={t('settings.idleWarningText')}
                          minRows={4}
                          maxLength={WELCOME_MESSAGE_LENGTH}
                          showMaxLength={true}
                          maxLengthBottom
                          onChange={(e) => field.onChange(e.target.value)}
                          defaultValue={idleMessage}
                          name="label"
                        />
                      )}
                    />
                      {getTooltip('settings.sessionLength.tooltip.showEndMessage')}
                    </Track>
                  )}
                </>
              )}
            />
            <Controller
              name="showAutoCloseText"
              control={control}
              render={({ field }) => (
                <>
                  <Switch
                    label={t('settings.showAutoCloseText')}
                    onLabel={t('global.yes') ?? 'yes'}
                    offLabel={t('global.no') ?? 'no'}
                    onCheckedChange={(e) => field.onChange(e)}
                    checked={field.value}
                    tooltip={<InfoTooltip name='settings.sessionLength.tooltip.showEndMessage' />}
                    {...field}
                  />
                  {showAutoCloseText && (
                    <Track gap={10} style={{ width: '100%' }}>
                    <Controller
                      name="autoCloseText"
                      control={control}
                      render={({ field }) => (
                        <FormTextarea
                          label={t('settings.autoCloseText')}
                          minRows={4}
                          maxLength={WELCOME_MESSAGE_LENGTH}
                          showMaxLength={true}
                          maxLengthBottom
                          onChange={(e) => field.onChange(e.target.value)}
                          defaultValue={autoCloseText}
                          name="label"
                        />
                      )}
                    />
                      {getTooltip('endMessageText')}
                    </Track>
                  )}
                </>
              )}
            />
          </Track>
      </Card>
    </>
  );
};

export default withAuthorization(SettingsSessionLength, [
  ROLES.ROLE_ADMINISTRATOR,
]);
