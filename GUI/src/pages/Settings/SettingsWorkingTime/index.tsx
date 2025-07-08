import { FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { format, parse } from 'date-fns';
import {
  Button,
  Card,
  FormDatepicker,
  FormTextarea,
  Switch,
  Track,
} from 'components';
import { OrganizationWorkingTime } from 'types/organizationWorkingTime';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import './SettingsWorkingTime.scss';
import { getOrganizationTimeData, setOrganizationTimeData } from './data';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import {
  BOT_CANNOT_ANSWER_MESSAGE_LENGTH,
  NO_CSA_MESSAGE_LENGTH,
  OUTSIDE_WORKING_HOURS_MESSAGE_LENGTH,
} from 'constants/config';

type FieldDateNames = {
  start: string;
  end: string;
};

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
  const { control, getValues, handleSubmit, reset, watch } =
    useForm<OrganizationWorkingTime>();
  const [key, setKey] = useState(0);
  const isOrganizationAvailableAllTime = watch('organizationWorkingAllTime');
  const isOrganizationClosedOnWeekEnds = watch('organizationClosedOnWeekEnds');
  const isOrganizationTheSameOnAllWorkingDays = watch(
    'organizationTheSameOnAllWorkingDays'
  );
  const organizationWorkingTimeWeekdays = watch(
    'organizationWorkingTimeWeekdays'
  );
  const { data: workingTime } = useQuery<OrganizationWorkingTime>({
    queryKey: ['configs/organization-working-time', 'prod'],
    onSuccess: (data: any) => {
      if (Object.keys(control._formValues).length > 0) return;
      reset(getOrganizationTimeData(data.response));
      setKey(key + 1);
    },
  });

  const workingTimeMutation = useMutation({
    mutationFn: (data: OrganizationWorkingTime) =>
      apiDev.post<OrganizationWorkingTime>(
        'configs/organization-working-time',
        setOrganizationTimeData(data)
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

  function sortAndJoin(array: string[]): string {
    return array.toSorted((a, b) => a.localeCompare(b)).join(',');
  }

  function filterAndJoin(array: string[], day: string): string {
    return array.filter((pd: string) => pd !== day.toLowerCase()).join(',');
  }

  if (!workingTime || Object.keys(control._formValues).length === 0) {
    return <>Loading...</>;
  }

  const handleTime = (field: any, date: any, isStart: boolean) => {
    const { minTime, maxTime } = getStartEndTimeValues(field, isStart);
    if (isStart && date > maxTime) {
      field.onChange(minTime);
    }
    if (!isStart && date < minTime) {
      field.onChange(maxTime);
    }
    field.onChange(date);
  };

  const getStartEndTimeValues = (field: any, isStart: boolean) => {
    const fieldNames = getFieldNames(field, isStart);
    const minTime = adjustTimeGap(fieldNames.start, true);
    const maxTime = adjustTimeGap(fieldNames.end, false);
    return { minTime: minTime, maxTime: maxTime };
  };

  const adjustTimeGap = (date: any, isStart: boolean) => {
    const convertedDate = parse(
      format(getValues(date) as Date, 'HH:mm:ss'),
      'HH:mm:ss',
      new Date()
    );
    let adjustedTime = new Date(convertedDate);
    if (isStart) {
      adjustedTime.setMinutes(adjustedTime.getMinutes() + 15);
    } else {
      adjustedTime.setMinutes(adjustedTime.getMinutes() - 15);
    }
    return adjustedTime;
  };

  const filterTime = (date: any, isStart: any, time: any) => {
    return date > time;
  };

  const getFieldNames = (field: any, isStart: boolean): FieldDateNames => {
    let startingTime = '';
    let endingTime = '';
    if (isStart) {
      startingTime = field.name;
      endingTime = field.name.replace('Start', 'End');
    } else {
      startingTime = field.name.replace('End', 'Start');
      endingTime = field.name;
    }

    return { start: startingTime, end: endingTime };
  };

  return (
    <>
      <h1>{t('settings.workingTime.title')}</h1>
      <p>{t('settings.workingTime.description')}</p>
      <Card
        key={key}
        isHeaderLight={true}
        isBodyDivided={true}
        isScrollable={true}
        footer={
          <Track justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
        header={
          <Track gap={8} direction="vertical" align="left">
            <Controller
              name="organizationWorkingAllTime"
              control={control}
              render={({ field }) => (
                <Switch
                  label={t('settings.workingTime.availableAllTime')}
                  onLabel={t('global.yes').toString()}
                  offLabel={t('global.no').toString()}
                  onCheckedChange={field.onChange}
                  checked={field.value}
                  {...field}
                />
              )}
            />
            {!isOrganizationAvailableAllTime && (
              <Controller
                name="organizationWorkingTimeNationalHolidays"
                control={control}
                render={({ field }) => (
                  <Switch
                    label={t('settings.workingTime.publicHolidays')}
                    onLabel={t('global.yes').toString()}
                    offLabel={t('global.no').toString()}
                    onCheckedChange={field.onChange}
                    checked={field.value}
                    {...field}
                  />
                )}
              />
            )}
            {!isOrganizationAvailableAllTime && (
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
            )}
            {!isOrganizationAvailableAllTime && (
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
            )}
          </Track>
        }
      >
        {isOrganizationTheSameOnAllWorkingDays &&
          !isOrganizationAvailableAllTime && (
            <Track>
              <label className="Label">
                {t(
                  `${
                    isOrganizationClosedOnWeekEnds
                      ? 'settings.workingTime.allWeekdaysExceptWeekend'
                      : 'settings.workingTime.allWeekdays'
                  }`
                )}
              </label>
              <Controller
                name={'organizationAllWeekdaysTimeStartISO'}
                control={control}
                render={({ field }) => {
                  const { maxTime } = getStartEndTimeValues(field, true);
                  return (
                    <div className="startTime">
                      <FormDatepicker
                        {...field}
                        timePicker
                        hideLabel
                        direction="row"
                        label=""
                        value={
                          parse(
                            format(field.value as Date, 'HH:mm:ss'),
                            'HH:mm:ss',
                            new Date()
                          ) ?? new Date('0')
                        }
                        onChange={(date) => handleTime(field, date, true)}
                        maxTime={maxTime}
                      />
                    </div>
                  );
                }}
              />
              <label>{t('settings.workingTime.until')}</label>
              <Controller
                name={'organizationAllWeekdaysTimeEndISO'}
                control={control}
                render={({ field }) => {
                  const { minTime } = getStartEndTimeValues(field, false);
                  return (
                    <div className="endTime">
                      <FormDatepicker
                        {...field}
                        timePicker
                        hideLabel
                        direction="row"
                        label=""
                        value={
                          parse(
                            format(field.value as Date, 'HH:mm:ss'),
                            'HH:mm:ss',
                            new Date()
                          ) ?? new Date('0')
                        }
                        onChange={(date) => handleTime(field, date, false)}
                        minTime={minTime}
                      />
                    </div>
                  );
                }}
              />
            </Track>
          )}
        {!isOrganizationTheSameOnAllWorkingDays &&
          !isOrganizationAvailableAllTime &&
          weekdaysOptions
            .filter(
              (d) =>
                !(
                  isOrganizationClosedOnWeekEnds &&
                  (d === 'Saturday' || d === 'Sunday')
                )
            )
            .map((d) => (
              <Track key={d}>
                <label className="Label switch">
                  {t(`settings.weekdays.${d}`.toLowerCase())}
                </label>
                <Controller
                  name="organizationWorkingTimeWeekdays"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Switch
                        label=""
                        onLabel={t('settings.workingTime.open').toString()}
                        offLabel={t('settings.workingTime.closed').toString()}
                        onCheckedChange={(value) => {
                          field.onChange(
                            value
                              ? sortAndJoin([
                                  ...field.value.toString().split(','),
                                  d.toLowerCase(),
                                ])
                              : filterAndJoin(
                                  field.value.toString().split(','),
                                  d
                                )
                          );
                        }}
                        checked={field.value?.includes(d.toLowerCase())}
                        {...field}
                      />
                    </div>
                  )}
                />
                {organizationWorkingTimeWeekdays.includes(d.toLowerCase()) && (
                  <Track>
                    <Controller
                      name={
                        `organization${d}WorkingTimeStartISO` as keyof OrganizationWorkingTime
                      }
                      control={control}
                      render={({ field }) => {
                        const { maxTime } = getStartEndTimeValues(field, true);
                        return (
                          <div className="startTime">
                            <FormDatepicker
                              {...field}
                              timePicker
                              hideLabel
                              direction="row"
                              label=""
                              value={
                                parse(
                                  format(field.value as Date, 'HH:mm:ss'),
                                  'HH:mm:ss',
                                  new Date()
                                ) ?? new Date('0')
                              }
                              onChange={(date) => handleTime(field, date, true)}
                              maxTime={maxTime}
                            />
                          </div>
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
                        const { minTime } = getStartEndTimeValues(field, false);
                        return (
                          <div className="endTime">
                            <FormDatepicker
                              {...field}
                              timePicker
                              hideLabel
                              direction="row"
                              label=""
                              value={
                                parse(
                                  format(field.value as Date, 'HH:mm:ss'),
                                  'HH:mm:ss',
                                  new Date()
                                ) ?? new Date('0')
                              }
                              onChange={(date) =>
                                handleTime(field, date, false)
                              }
                              minTime={minTime}
                              filterTime={(date: any) =>
                                filterTime(date, false, minTime)
                              }
                            />
                          </div>
                        );
                      }}
                    />
                  </Track>
                )}
              </Track>
            ))}
        {!isOrganizationAvailableAllTime && (
          <Controller
            name="organizationOutsideWorkingHoursAskForContacts"
            control={control}
            render={({ field }) => (
              <Switch
                label={t(
                  'settings.workingTime.showIfOrganizationIsOutsideWorkingHours'
                )}
                onLabel={t('global.yes').toString()}
                offLabel={t('global.no').toString()}
                onCheckedChange={(e) => field.onChange(!e)}
                checked={!field.value}
                {...field}
              />
            )}
          />
        )}
        {!isOrganizationAvailableAllTime && (
          <Controller
            name="organizationOutsideWorkingHoursAskForContacts"
            control={control}
            render={({ field }) => (
              <Switch
                label={t(
                  'settings.workingTime.showIfOrganizationIsOutsideWorkingHoursWithContactsRequest'
                )}
                onLabel={t('global.yes').toString()}
                offLabel={t('global.no').toString()}
                onCheckedChange={field.onChange}
                checked={field.value}
                {...field}
              />
            )}
          />
        )}
        {!isOrganizationAvailableAllTime && (
          <div style={{ paddingRight: '20px' }}>
            <Controller
              name="organizationOutsideWorkingHoursMessage"
              control={control}
              render={({ field }) => (
                <FormTextarea
                  label={t('settings.workingTime.outsideWorkingHoursMessage')}
                  maxLength={OUTSIDE_WORKING_HOURS_MESSAGE_LENGTH}
                  showMaxLength
                  maxLengthBottom
                  onChange={field.onChange}
                  defaultValue={field.value}
                  name="label"
                  useRichText
                />
              )}
            />
          </div>
        )}
        <Controller
          name="organizationNoCsaAskForContacts"
          control={control}
          render={({ field }) => (
            <Switch
              label={t('settings.workingTime.showIfCSAIsNotAvailable')}
              onLabel={t('global.yes').toString()}
              offLabel={t('global.no').toString()}
              onCheckedChange={(e) => field.onChange(!e)}
              checked={!field.value}
              {...field}
            />
          )}
        />
        <Controller
          name="organizationNoCsaAskForContacts"
          control={control}
          render={({ field }) => (
            <Switch
              label={t(
                'settings.workingTime.showIfCSAIsNotAvailableWithContactsRequest'
              )}
              onLabel={t('global.yes').toString()}
              offLabel={t('global.no').toString()}
              onCheckedChange={field.onChange}
              checked={field.value}
              {...field}
            />
          )}
        />
        <div style={{ paddingRight: '20px' }}>
          <Controller
            name="organizationNoCsaAvailableMessage"
            control={control}
            render={({ field }) => (
              <FormTextarea
                label={t('settings.workingTime.noCsaAvailableMessage')}
                maxLength={NO_CSA_MESSAGE_LENGTH}
                showMaxLength
                maxLengthBottom
                onChange={field.onChange}
                defaultValue={field.value}
                name="label"
                useRichText
              />
            )}
          />
        </div>
        <Controller
          name="organizationBotCannotAnswerAskToForwardToCSA"
          control={control}
          render={({ field }) => (
            <Switch
              label={t(
                'settings.workingTime.showIfBotCannotAnswerAskToForwardToCSA'
              )}
              onLabel={t('global.yes').toString()}
              offLabel={t('global.no').toString()}
              onCheckedChange={field.onChange}
              checked={field.value}
              {...field}
            />
          )}
        />
        <div style={{ paddingRight: '20px' }}>
          <Controller
            name="organizationBotCannotAnswerMessage"
            control={control}
            render={({ field }) => (
              <FormTextarea
                label={t('settings.workingTime.botCannotAnswerMessage')}
                maxLength={BOT_CANNOT_ANSWER_MESSAGE_LENGTH}
                showMaxLength
                maxLengthBottom
                onChange={field.onChange}
                defaultValue={field.value}
                name="label"
                useRichText
              />
            )}
          />
        </div>
      </Card>
    </>
  );
};

export default withAuthorization(SettingsWorkingTime, [
  ROLES.ROLE_ADMINISTRATOR,
]);
