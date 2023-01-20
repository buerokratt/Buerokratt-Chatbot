import { FC } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { AxiosError } from 'axios';

import { Button, Card, FormInput, Switch, Track } from 'components';
import { WidgetConfig } from 'types/widgetConfig';
import { useToast } from 'hooks/useToast';
import api from 'services/api';

const SettingsAppearance: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { register, control, handleSubmit, reset } = useForm<WidgetConfig>();
  const { data: widgetConfig } = useQuery<WidgetConfig>({
    queryKey: ['cs-get-widget-config'],
    onSuccess: (data) => reset(data),
  });

  const widgetConfigMutation = useMutation({
    mutationFn: (data: WidgetConfig) => api.post<WidgetConfig>('cs-set-widget-config', data),
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    widgetConfigMutation.mutate(data);
  });

  if (!widgetConfig) return <>Loading...</>;

  return (
    <>
      <h1>{t('settings.appearance.title')}</h1>

      <Card
        footer={
          <Track gap={8} justify='end'>
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
            <Button appearance='secondary'>{t('global.preview')}</Button>
          </Track>
        }
      >
        <Track gap={8} direction='vertical' align='left'>
          <FormInput
            {...register('widgetProactiveSeconds')}
            label={t('settings.appearance.widgetProactiveSeconds')}
            type='number'
          />
          <Controller
            name='isWidgetActive'
            control={control}
            render={({ field }) =>
              <Switch
                onCheckedChange={field.onChange}
                label={t('settings.appearance.widgetBubbleMessageText')}
                checked={widgetConfig.isWidgetActive}
                {...field}
              />
            }
          />
          <FormInput
            {...register('widgetDisplayBubbleMessageSeconds')}
            label={t('settings.appearance.widgetDisplayBubbleMessageSeconds')}
            type='number'
          />
          <FormInput
            {...register('widgetBubbleMessageText')}
            label={t('settings.appearance.widgetBubbleMessageText')}
          />
          <FormInput
            {...register('widgetColor')}
            label={t('settings.appearance.widgetColor')}
            colorInput
          />
        </Track>
      </Card>
    </>
  );
};

export default SettingsAppearance;
