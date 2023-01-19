import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import { Button, Card, FormDatepicker, FormTextarea, Switch, Track } from 'components';
import { EMERGENCY_NOTICE_LENGTH } from 'constants/config';
import { EmergencyNotice } from 'types/emergencyNotice';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import api from 'services/api';

const SettingsEmergencyNotices: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { register, handleSubmit, reset } = useForm<EmergencyNotice>();
  const { data: emergencyNotice } = useQuery<EmergencyNotice>({
    queryKey: ['cs-get-emergency-notice'],
    onSuccess: (data) => reset(data),
  });

  const emergencyNoticeMutation = useMutation({
    mutationFn: (data: EmergencyNotice) => api.post<EmergencyNotice>('cs-set-emergency-notice', data),
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    emergencyNoticeMutation.mutate(data);
  });

  if (!emergencyNotice) return <>Loading...</>;

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
          <Switch
            {...register('isEmergencyNoticeVisible')}
            defaultChecked={emergencyNotice.isEmergencyNoticeVisible}
            label={t('settings.emergencyNotices.noticeActive')}
          />
          <FormTextarea
            {...register('emergencyNoticeText')}
            label={t('settings.emergencyNotices.notice')}
            minRows={1}
            maxLength={EMERGENCY_NOTICE_LENGTH}
            defaultValue={emergencyNotice.emergencyNoticeText}
            showMaxLength
          />
          <Track gap={8}>
            <p style={{ flex: '0 0 170px' }}>{t('settings.emergencyNotices.displayPeriod')}</p>
            <Track gap={16}>
              <FormDatepicker {...register('emergencyNoticeStartISO')} label={t('global.startDate')} hideLabel />
              <span>{t('global.to').toLowerCase()}</span>
              <FormDatepicker {...register('emergencyNoticeEndISO')} label={t('global.endDate')} hideLabel />
            </Track>
          </Track>
        </Track>
      </Card>
    </>
  );
};

export default SettingsEmergencyNotices;
