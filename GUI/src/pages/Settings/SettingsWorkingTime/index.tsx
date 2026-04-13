import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Button, Card, FormDatepicker, FormTextarea, Switch, Track } from 'components';
import { format, parse } from 'date-fns';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { apiDev } from 'services/api';
import { OrganizationWorkingTime, OrganizationWorkingTimeResponse } from 'types/organizationWorkingTime';
import './SettingsWorkingTime.scss';
import { ROLES } from 'utils/constants';

import { getDefaultValues, getOrganizationTimeData, setOrganizationTimeData } from './data';

import {
  BOT_CANNOT_ANSWER_MESSAGE_LENGTH,
  isValidationsEnabled,
  NO_CSA_MESSAGE_LENGTH,
  OUTSIDE_WORKING_HOURS_MESSAGE_LENGTH,
  REDIRECT_IF_BOT_CANNOT_ANSWER_MESSAGE_LENGTH,
  VALIDATION_NO_CSA_MESSAGE_LENGTH,
} from 'constants/config';

import DomainSelector from '../../../components/DomainsSelector';
import { useDomainSelectionHandler } from '../../../hooks/useDomainSelectionHandler';
import { fetchConfigurationFromDomain } from '../../../services/configurations';
import { InfoTooltip } from '../../../utils/getToolTipWithText';

type FieldDateNames = {
  start: string;
  end: string;
};

const weekdaysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SettingsWorkingTime: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { control, getValues, handleSubmit, reset, watch } = useForm<OrganizationWorkingTime>({
    defaultValues: getDefaultValues(),
  });
  const [loadingCompleted, setLoadingCompleted] = useState<boolean>(false);
  const [key, setKey] = useState(0);
  const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const resetSettingsToDefault = () => {
    reset(getDefaultValues());
    setKey(key + 1);
  };

  useEffect(() => {
    if (!multiDomainEnabled) {
      fetchData('none');
    } else {
      resetSettingsToDefault();
      setLoadingCompleted(true);
    }
  }, []);

  const isOrganizationAvailableAllTime = watch('organizationWorkingAllTime');
  const isOrganizationClosedOnWeekEnds = watch('organizationClosedOnWeekEnds');
  const isOrganizationTheSameOnAllWorkingDays = watch('organizationTheSameOnAllWorkingDays');
  const organizationWorkingTimeWeekdays = watch('organizationWorkingTimeWeekdays');
  const isOrganizationUseCSA = watch('organizationUseCSA');
  const fetchData = async (selectedDomain: string) => {
    try {
      const data: OrganizationWorkingTimeResponse = await fetchConfigurationFromDomain<OrganizationWorkingTimeResponse>(
        'configs/organization-working-time',
        selectedDomain,
      );
      const res = data.response;

      reset(getOrganizationTimeData(res));
      setKey(key + 1);
      setLoadingCompleted(true);
    } catch (error) {
      console.error('Failed to working time', error);
    }
  };

  const workingTimeMutation = useMutation({
    mutationFn: (data: OrganizationWorkingTime) =>
      apiDev.post<OrganizationWorkingTime>('configs/organization-working-time', setOrganizationTimeData(data)),
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
    data.domainUUID = multiDomainEnabled ? selectedDomains : [];
    workingTimeMutation.mutate(data);
  });

  function sortAndJoin(array: string[]): string {
    return array.toSorted((a, b) => a.localeCompare(b)).join(',');
  }

  function filterAndJoin(array: string[], day: string): string {
    return array.filter((pd: string) => pd !== day.toLowerCase()).join(',');
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
    const convertedDate = parse(format(getValues(date) as Date, 'HH:mm:ss'), 'HH:mm:ss', new Date());
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

  const handleDomainSelection = useDomainSelectionHandler(setSelectedDomains, fetchData, resetSettingsToDefault);

  if (!loadingCompleted) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>{t('settings.workingTime.title')}</h1>
      <p>{t('settings.workingTime.description')}</p>

      {multiDomainEnabled && (
        <div style={{ marginBottom: '11px' }}>
          <DomainSelector
            onChange={(selected) => {
              handleDomainSelection(selected);
            }}
          />
        </div>
      )}

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
              name="organizationUseCSA"
              control={control}
              render={({ field }) => (
                <Switch
                  label={t('settings.workingTime.organizationUseCSA')}
                  onLabel={t('global.yes').toString()}
                  offLabel={t('global.no').toString()}
                  onCheckedChange={field.onChange}
                  checked={field.value}
                  tooltip={<InfoTooltip name="settings.workingTime.tooltip.useCsa" />}
                  {...field}
                />
              )}
            />
            {isOrganizationUseCSA && (
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
                    tooltip={<InfoTooltip name="settings.workingTime.tooltip.work24/7" />}
                    {...field}
                  />
                )}
              />
            )}
            {!isOrganizationAvailableAllTime && isOrganizationUseCSA && (
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
                    tooltip={<InfoTooltip name="settings.workingTime.tooltip.workingHolidays" />}
                    {...field}
                  />
                )}
              />
            )}
            {!isOrganizationAvailableAllTime && isOrganizationUseCSA && (
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
                    tooltip={<InfoTooltip name="settings.workingTime.tooltip.workingWeekends" />}
                    {...field}
                  />
                )}
              />
            )}
            {!isOrganizationAvailableAllTime && isOrganizationUseCSA && (
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
                    tooltip={<InfoTooltip name="settings.workingTime.tooltip.workingSameEachDay" />}
                    {...field}
                  />
                )}
              />
            )}
          </Track>
        }
      >
        {isOrganizationTheSameOnAllWorkingDays && !isOrganizationAvailableAllTime && isOrganizationUseCSA && (
          <Track>
            <label className="Label">
              {t(
                `${
                  isOrganizationClosedOnWeekEnds
                    ? 'settings.workingTime.allWeekdaysExceptWeekend'
                    : 'settings.workingTime.allWeekdays'
                }`,
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
                      value={parse(format(field.value as Date, 'HH:mm:ss'), 'HH:mm:ss', new Date()) ?? new Date('0')}
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
                      value={parse(format(field.value as Date, 'HH:mm:ss'), 'HH:mm:ss', new Date()) ?? new Date('0')}
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
          isOrganizationUseCSA &&
          weekdaysOptions
            .filter((d) => !(isOrganizationClosedOnWeekEnds && (d === 'Saturday' || d === 'Sunday')))
            .map((d) => (
              <Track key={d}>
                <label className="Label switch">{t(`settings.weekdays.${d}`.toLowerCase())}</label>
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
                              ? sortAndJoin([...field.value.toString().split(','), d.toLowerCase()])
                              : filterAndJoin(field.value.toString().split(','), d),
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
                      name={`organization${d}WorkingTimeStartISO` as keyof OrganizationWorkingTime}
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
                                parse(format(field.value as Date, 'HH:mm:ss'), 'HH:mm:ss', new Date()) ?? new Date('0')
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
                      name={`organization${d}WorkingTimeEndISO` as keyof OrganizationWorkingTime}
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
                                parse(format(field.value as Date, 'HH:mm:ss'), 'HH:mm:ss', new Date()) ?? new Date('0')
                              }
                              onChange={(date) => handleTime(field, date, false)}
                              minTime={minTime}
                              filterTime={(date: any) => filterTime(date, false, minTime)}
                            />
                          </div>
                        );
                      }}
                    />
                  </Track>
                )}
              </Track>
            ))}
        {!isOrganizationAvailableAllTime && isOrganizationUseCSA && (
          <Controller
            name="organizationOutsideWorkingHoursAskForContacts"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('settings.workingTime.showIfOrganizationIsOutsideWorkingHours')}
                onLabel={t('global.yes').toString()}
                offLabel={t('global.no').toString()}
                onCheckedChange={field.onChange}
                checked={field.value}
                tooltip={<InfoTooltip name="settings.workingTime.tooltip.sendCsa" />}
                {...field}
              />
            )}
          />
        )}
        {!isOrganizationAvailableAllTime && isOrganizationUseCSA && (
          <div style={{ paddingRight: '20px' }}>
            <Controller
              name="organizationOutsideWorkingHoursMessage"
              control={control}
              render={({ field }) => (
                <Track gap={10} style={{ width: '100%' }}>
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
                  <InfoTooltip name="settings.workingTime.tooltip.outOfWorkingHoursText" />
                </Track>
              )}
            />
          </div>
        )}
        {isOrganizationUseCSA && (
          <Controller
            name="organizationNoCsaAskForContacts"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('settings.workingTime.showIfCSAIsNotAvailable')}
                onLabel={t('global.yes').toString()}
                offLabel={t('global.no').toString()}
                onCheckedChange={field.onChange}
                checked={field.value}
                tooltip={<InfoTooltip name="settings.workingTime.tooltip.csaOutOfReach" />}
                {...field}
              />
            )}
          />
        )}
        {isOrganizationUseCSA && (
          <div style={{ paddingRight: '20px' }}>
            <Controller
              name="organizationNoCsaAvailableMessage"
              control={control}
              render={({ field }) => (
                <Track gap={10} style={{ width: '100%' }}>
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
                  <InfoTooltip name="settings.workingTime.tooltip.allCsaAway" />
                </Track>
              )}
            />
          </div>
        )}
        {isOrganizationUseCSA && (
          <div style={{ paddingRight: '20px' }}>
            <Controller
              name="organizationRedirectIfBotCannotAnswerMessage"
              control={control}
              render={({ field }) => (
                <Track gap={10} style={{ width: '100%' }}>
                  <FormTextarea
                    label={t('settings.workingTime.redirectIfBotCannotAnswerMessage')}
                    maxLength={REDIRECT_IF_BOT_CANNOT_ANSWER_MESSAGE_LENGTH}
                    showMaxLength
                    maxLengthBottom
                    onChange={field.onChange}
                    defaultValue={field.value}
                    name="label"
                    useRichText
                  />
                  <InfoTooltip name="settings.workingTime.tooltip.redirectIfBykCouldNotRespond" />
                </Track>
              )}
            />
          </div>
        )}
        {!isOrganizationUseCSA && (
          <div style={{ paddingRight: '20px' }}>
            <Controller
              name="organizationBotCannotAnswerMessage"
              control={control}
              render={({ field }) => (
                <Track gap={10} style={{ width: '100%' }}>
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
                  <InfoTooltip name="settings.workingTime.tooltip.bykCouldNotRespond" />
                </Track>
              )}
            />
          </div>
        )}
        {isValidationsEnabled && (
          <div style={{ paddingRight: '20px' }}>
            <Controller
              name="organizationValidationNoCsaMessage"
              control={control}
              render={({ field }) => (
                <Track gap={10} style={{ width: '100%' }}>
                  <FormTextarea
                    label={t('settings.workingTime.validationNoCsaMessage')}
                    maxLength={VALIDATION_NO_CSA_MESSAGE_LENGTH}
                    showMaxLength
                    maxLengthBottom
                    onChange={field.onChange}
                    defaultValue={field.value}
                    name="label"
                    useRichText
                  />
                  <InfoTooltip name="settings.workingTime.tooltip.validationNoCsaMessage" />
                </Track>
              )}
            />
          </div>
        )}
      </Card>
    </>
  );
};

export default withAuthorization(SettingsWorkingTime, [ROLES.ROLE_ADMINISTRATOR]);
