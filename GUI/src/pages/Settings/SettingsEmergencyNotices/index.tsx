import { FC, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import { Button, Card, FormDatepicker, FormTextarea, Switch, Track } from 'components';
import { EMERGENCY_NOTICE_LENGTH } from 'constants/config';
import { EmergencyNotice } from 'types/emergencyNotice';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import apiDevV2 from 'services/api-dev-v2';

const SettingsEmergencyNotices: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { register, control, handleSubmit, reset } = useForm<EmergencyNotice>();
  const [isEmergencyNoticeVisible, setIsEmergencyNoticeVisible] = useState(false);
  const [emergencyNoticeText, setEmergencyNoticeText] = useState("");
  const { data: emergencyNotice } = useQuery<EmergencyNotice>({
    queryKey: ['cs-get-emergency-notice', 'prod-2'],
    onSuccess: (data) => {
      if (Object.keys(control._formValues).length > 0) return;
      setIsEmergencyNoticeVisible(data.isEmergencyNoticeVisible ?? false);
      setEmergencyNoticeText(data.emergencyNoticeText ?? '');
      reset({
        emergencyNoticeStartISO: new Date(data.emergencyNoticeStartISO ?? '0'),
        emergencyNoticeEndISO: new Date(data.emergencyNoticeEndISO ?? '0'),
        emergencyNoticeText: data.emergencyNoticeText ?? '',
        isEmergencyNoticeVisible: data.isEmergencyNoticeVisible ?? false,
      });
    },
  });

  const emergencyNoticeMutation = useMutation({
    mutationFn: (data: EmergencyNotice) => apiDevV2.post<EmergencyNotice>('cs-set-emergency-notice', data),
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    const endDate = control._formValues.emergencyNoticeEndISO as Date;
    endDate.setDate(endDate.getDate() + 1);
    emergencyNoticeMutation.mutate({
      ...data,
      emergencyNoticeEndISO: endDate,
      isEmergencyNoticeVisible,
      emergencyNoticeText,
    });
  });
  if (!emergencyNotice || Object.keys(control._formValues).length === 0) return <>Loading...</>;

  return (
    <>
      <h1>{t('settings.emergencyNotices.title')}</h1>

      <Card
        footer={
          <Track justify='end'>
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={16} direction='vertical' align='left'>
          <Controller name='isEmergencyNoticeVisible' control={control} render={({ field }) =>
            <Switch
              checked={isEmergencyNoticeVisible}
              onCheckedChange={(c) => setIsEmergencyNoticeVisible(c)}
              label={t('settings.emergencyNotices.noticeActive')}
              {...field}
            />
          }
          />
          <FormTextarea
            {...register('emergencyNoticeText')}
            label={t('settings.emergencyNotices.notice')}
            minRows={1}
            maxLength={EMERGENCY_NOTICE_LENGTH}
            defaultValue={emergencyNoticeText}
            showMaxLength
            onChange={(e) => setEmergencyNoticeText(e.target.value)}
          />
          <Track gap={8}>
            <p style={{ flex: '0 0 170px' }}>{t('settings.emergencyNotices.displayPeriod')}</p>
            <Track gap={16}>
              <Controller
                name='emergencyNoticeStartISO'
                control={control}
                render={({ field }) =>
                  <FormDatepicker
                  label={t('global.startDate')}
                  hideLabel
                  {...field}
                  value={field.value ?? new Date('0')}
                />
                }
              />
              <span>{t('global.to').toLowerCase()}</span>
              <Controller
                name='emergencyNoticeEndISO'
                control={control}
                render={({ field }) =>
                  <FormDatepicker
                  label={t('global.endDate')}
                  hideLabel
                  {...field}
                  value={field.value ?? new Date('0')}
                />
                }
              />
            </Track>
          </Track>
        </Track>
      </Card>
    </>
  );
};

export default SettingsEmergencyNotices;
