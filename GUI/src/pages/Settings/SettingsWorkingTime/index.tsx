import { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import { Button, Card, FormCheckbox, FormCheckboxes, FormDatepicker, Switch, Track } from 'components';
import { OrganizationWorkingTime } from 'types/organizationWorkingTime';
import { useToast } from 'hooks/useToast';
import apiDevV2 from 'services/api-dev-v2';

const weekdaysOptions = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const SettingsWorkingTime: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { control, handleSubmit, reset } = useForm<OrganizationWorkingTime>();
  const { data: workingTime } = useQuery<{response: OrganizationWorkingTime}>({
    queryKey: ['cs-get-organization-working-time', 'prod-2'],
    onSuccess: (data) => {
      reset({
      organizationWorkingTimeStartISO: new Date(data.response.organizationWorkingTimeStartISO),
      organizationWorkingTimeEndISO: new Date(data.response.organizationWorkingTimeEndISO),
    })},
  });

  const workingTimeMutation = useMutation({
    mutationFn: (data: OrganizationWorkingTime) => apiDevV2.post<OrganizationWorkingTime>('cs-set-organization-working-time', data),
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
        <Track gap={8} direction='vertical' align='left'>
          <Controller
            name='organizationWorkingTimeStartISO'
            control={control}
            render={({ field }) =>
              <FormDatepicker
                timePicker
                label={t('settings.workingTime.openFrom')}
                {...field}
              />
            }
          />
          <Controller
            name='organizationWorkingTimeEndISO'
            control={control}
            render={({ field }) =>
              <FormDatepicker
                timePicker
                label={t('settings.workingTime.openUntil')}
                {...field}
              />
            }
          />
          <FormCheckboxes
            name='organizationWorkingTimeWeekdays'
            label={t('settings.weekdays.label')}
            items={weekdaysOptions.map((d) => ({ label: t(`settings.weekdays.${d}`), value: d }))}
          />
          <Switch
            name='organizationWorkingTimeNationalHolidays'
            label={t('settings.nationalHolidays')}
          />
        </Track>
      </Card>
    </>
  );
};

export default SettingsWorkingTime;
