import { FC, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Card,
  FormCheckbox,
  FormDatepicker,
  Switch,
  Track,
} from 'components';
import { OrganizationWorkingTime } from 'types/organizationWorkingTime';
import { useToast } from 'hooks/useToast';
import apiDevV2 from 'services/api-dev-v2';
import './SettingsWorkingTime.scss';

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
  const [key, setKey] = useState(0);
  const { data: workingTime } = useQuery<OrganizationWorkingTime>({
    queryKey: ['cs-get-organization-working-time', 'prod-2'],
    onSuccess: (data) => {
      if (Object.keys(control._formValues).length > 0) return;
      reset({
        organizationWorkingTimeStartISO: data.organizationWorkingTimeStartISO
          ? new Date(data.organizationWorkingTimeStartISO)
          : new Date(),
        organizationWorkingTimeEndISO: data.organizationWorkingTimeEndISO
          ? new Date(data.organizationWorkingTimeEndISO)
          : new Date(),
        organizationWorkingTimeNationalHolidays:
          data.organizationWorkingTimeNationalHolidays ?? false,
        organizationWorkingTimeWeekdays:
          data.organizationWorkingTimeWeekdays ?? [],
      });
      setKey(key + 1);
    },
  });

  const workingTimeMutation = useMutation({
    mutationFn: (data: OrganizationWorkingTime) =>
      apiDevV2.post<OrganizationWorkingTime>(
        'cs-set-organization-working-time',
        data
      ),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.updateSuccess'),
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

  const handleFormSubmit = handleSubmit((data) => {
    workingTimeMutation.mutate(data);
  });

  if (!workingTime || Object.keys(control._formValues).length === 0) {
    return <>Loading...</>;
  }
  return (
    <>
      <h1>{t('settings.workingTime.title')}</h1>

      <Card
        key={key}
        footer={
          <Track justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={8} direction="vertical" align="left">
          <Controller
            name="organizationWorkingTimeStartISO"
            control={control}
            render={({ field }) => {
              return (
                <FormDatepicker
                  {...field}
                  timePicker
                  label={t('settings.workingTime.openFrom')}
                  value={field.value ?? new Date('0')}
                />
              );
            }}
          />
          <Controller
            name="organizationWorkingTimeEndISO"
            control={control}
            render={({ field }) => (
              <FormDatepicker
                {...field}
                timePicker
                label={t('settings.workingTime.openUntil')}
                value={field.value ?? new Date('0')}
              />
            )}
          />
          <Controller
            name="organizationWorkingTimeWeekdays"
            control={control}
            render={({ field }) => (
              <>
                <div className="weekdays">
                  <label
                    htmlFor="organizationWorkingTimeWeekdaysWrapper"
                    className="weekdays__label"
                  >
                    {t('settings.weekdays.label')}
                  </label>
                  <div
                    id="organizationWorkingTimeWeekdaysWrapper"
                    className="weekdays__wrapper"
                  >
                    {weekdaysOptions.map((d) => {
                      return (
                        <FormCheckbox
                          key={`organizationWorkingTimeWeekdays-${d}`}
                          name={`organizationWorkingTimeWeekdays-${d}`}
                          label={''}
                          item={{
                            label: t(`settings.weekdays.${d}`),
                            value: d,
                            checked: field.value?.includes(d),
                          }}
                          onChange={(e) => {
                            field.onChange(
                              e.target.checked
                                ? [...field.value, d]
                                : field.value.filter((pd) => pd !== d)
                            );
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          />

          <Controller
            name="organizationWorkingTimeNationalHolidays"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('settings.nationalHolidays')}
                onCheckedChange={field.onChange}
                checked={field.value}
                {...field}
              />
            )}
          />
        </Track>
      </Card>
    </>
  );
};

export default SettingsWorkingTime;
