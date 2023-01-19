import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import { Button, Card, FormDatepicker, Track } from 'components';
import { OrganizationWorkingTime } from 'types/organizationWorkingTime';
import { useToast } from 'hooks/useToast';
import api from 'services/api';

const SettingsWorkingTime: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { register, handleSubmit, reset } = useForm<OrganizationWorkingTime>();
  const { data: workingTime } = useQuery<OrganizationWorkingTime>({
    queryKey: ['cs-get-organization-working-time'],
    onSuccess: (data) => reset(data),
  });

  const workingTimeMutation = useMutation({
    mutationFn: (data: OrganizationWorkingTime) => api.post<OrganizationWorkingTime>('cs-set-organization-working-time', data),
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    workingTimeMutation.mutate(data);
  });

  if (!workingTime) return <>Loading...</>;

  return (
    <>
      <h1>{t('settings.workingTime.title')}</h1>

      <Card
        footer={
          <Track justify='end'>
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={8} direction='vertical'>
          <FormDatepicker {...register( 'organizationWorkingTimeStartISO')} timePicker
                          label={t('settings.workingTime.openFrom')} />
          <FormDatepicker {...register('organizationWorkingTimeEndISO')} timePicker
                          label={t('settings.workingTime.openUntil')} />
        </Track>
      </Card>
    </>
  );
};

export default SettingsWorkingTime;
