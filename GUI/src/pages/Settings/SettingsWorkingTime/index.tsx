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
  Label,
  Switch,
  Track,
} from 'components';
import { OrganizationWorkingTime } from 'types/organizationWorkingTime';
import { useToast } from 'hooks/useToast';
import apiDevV2 from 'services/api-dev-v2';
import './SettingsWorkingTime.scss';

const weekdaysOptions = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
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
        // organizationWorkingTimeStartISO: data.organizationWorkingTimeStartISO
        //   ? new Date(data.organizationWorkingTimeStartISO)
        //   : new Date(),
        // organizationWorkingTimeEndISO: data.organizationWorkingTimeEndISO
        //   ? new Date(data.organizationWorkingTimeEndISO)
        //   : new Date(),
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
        {
          // organizationWorkingTimeStartISO: new Date(
          //   data.organizationWorkingTimeStartISO
          // ).toISOString(),
          // organizationWorkingTimeEndISO: new Date(
          //   data.organizationWorkingTimeEndISO
          // ).toISOString(),
          organizationWorkingTimeNationalHolidays:
            data.organizationWorkingTimeNationalHolidays,
          organizationWorkingTimeWeekdays: data.organizationWorkingTimeWeekdays,
        }
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

  const handleFormSubmit = handleSubmit((data) =>
    workingTimeMutation.mutate(data)
  );

  if (!workingTime || Object.keys(control._formValues).length === 0) {
    return <>Loading...</>;
  }
  return (
    <>
      <h1>{t('settings.workingTime.title')}</h1>
      <p>{t('settings.workingTime.description')}</p>
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
            name="organizationWorkingTimeNationalHolidays"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('settings.workingTime.publicHolidays')}
                onLabel={t('settings.workingTime.consider').toString()}
                offLabel={t('settings.workingTime.dontConsider').toString()}
                onCheckedChange={field.onChange}
                checked={field.value}
                {...field}
              />
            )}
          />
          <Controller
            name="organizationClosedOnWeekEnds"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('settings.workingTime.closedOnWeekends')}
                onLabel={t('global.yes').toString()}
                offLabel={t('global.no').toString()}
                onCheckedChange={field.onChange}
                checked={field.value}
                {...field}
              />
            )}
          />
          <Controller
            name="organizationTheSameOnAllWorkingDays"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('settings.workingTime.theSameOnAllWorkingDays')}
                onLabel={t('global.yes').toString()}
                offLabel={t('global.no').toString()}
                onCheckedChange={field.onChange}
                checked={field.value}
                {...field}
              />
            )}
          />
          <Controller
            name={
              `organizationMondayWorkingTimeEndISO` as keyof OrganizationWorkingTime
            }
            control={control}
            render={({ field }) => {
              return (
                <div
                  style={{
                    width: '45%',
                    // display: 'inline-flex',
                    flex: '1',
                  }}
                >
                  <FormDatepicker
                    {...field}
                    timePicker
                    label="s"
                    value={field.value ?? new Date('0')}
                  />
                  <label style={{ paddingRight: '20px' }}>
                    {t('settings.workingTime.until')}
                  </label>
                  <FormDatepicker
                    {...field}
                    timePicker
                    label=""
                    value={field.value ?? new Date('0')}
                  />
                </div>
              );
            }}
          />
          <div style={{ borderTop: '1px solid black',  width: '100%'}}></div>
          {/* <label>{t('settings.workingTime.until')}</label> */}
          {/* <Controller
            name={
              `organizationMondayWorkingTimeEndISO` as keyof OrganizationWorkingTime
            }
            control={control}
            render={({ field }) => {
              return (
                <FormDatepicker
                  {...field}
                  timePicker
                  label=""
                  value={field.value ?? new Date('0')}
                />
              );
            }}
          /> */}

          <Controller
            name="organizationWorkingTimeWeekdays"
            control={control}
            render={({ field }) => (
              <>
                <div className="weekdays">
                  <div
                    id="organizationWorkingTimeWeekdaysWrapper"
                    className="weekdays__wrapper"
                  >
                    {weekdaysOptions.map((d) => {
                      return (
                        <div>
                          <Switch
                            key={`organizationWorkingTimeWeekdays-${d}`}
                            label={t(`settings.weekdays.${d}`.toLowerCase())}
                            onLabel={t('settings.workingTime.open').toString()}
                            offLabel={t(
                              'settings.workingTime.closed'
                            ).toString()}
                            onCheckedChange={(e) => {
                              field.onChange(
                                e
                                  ? [...field.value, d.toLowerCase()]
                                  : field.value.filter(
                                      (pd) =>
                                        pd.toLowerCase() !== d.toLowerCase()
                                    )
                              );
                            }}
                            checked={field.value?.includes(d.toLowerCase())}
                            {...field}
                          />
                          <Controller
                            name={
                              `organization${d}WorkingTimeStartISO` as keyof OrganizationWorkingTime
                            }
                            control={control}
                            render={({ field }) => {
                              return (
                                <FormDatepicker
                                  {...field}
                                  timePicker
                                  label=""
                                  value={field.value ?? new Date('0')}
                                />
                              );
                            }}
                          />
                          <label>{t('settings.workingTime.until')}</label>
                          <Controller
                            name={
                              `organization${d}WorkingTimeEndISO` as keyof OrganizationWorkingTime
                            }
                            control={control}
                            render={({ field }) => {
                              return (
                                <FormDatepicker
                                  {...field}
                                  timePicker
                                  label=""
                                  value={field.value ?? new Date('0')}
                                />
                              );
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          />
        </Track>
      </Card>
    </>
  );
};

export default SettingsWorkingTime;
