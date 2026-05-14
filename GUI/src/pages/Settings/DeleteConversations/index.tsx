import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Button, Card, FormDatepicker, FormInput, Switch, Track } from 'components';
import { differenceInCalendarDays, format, parse, subDays } from 'date-fns';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { apiDev } from 'services/api';
import './DeleteConversations.scss';
import { ROLES } from 'utils/constants';
import { dateToLocalExcludingDST, dateToUTCExcludingDST } from 'utils/convert-date';

import DeletionChatOverview from '../../../components/DeletionChatOverview';
import { DeleteChatSettings } from '../../../types/deleteChatSettings';
import { InfoTooltip } from '../../../utils/getToolTipWithText';

const DeleteConversations: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { control, handleSubmit, reset } = useForm<DeleteChatSettings>({
    mode: 'onChange',
    shouldUnregister: true,
  });

  const { data: deleteConfig, isLoading: isConfigLoading } = useQuery<DeleteChatSettings>({
    queryKey: ['configs/delete-conversation-config', 'prod'],
    cacheTime: 0,
  });

  const plusDays = (date: Date, days: number): Date => {
    date.setDate(date.getDate() + days);
    return new Date(date.toISOString());
  };

  const calculateDateFrom = (daysForward: number): Date => {
    const today = new Date();
    if (!daysForward || daysForward === 0) return today;
    const differenceInDays = differenceInCalendarDays(today, endDate);
    const futureDate = daysForward + differenceInDays;
    return subDays(new Date(), futureDate);
  };

  const [isAuthMessaged, setIsAuthMessages] = useState<boolean>(false);
  const [isAnonymMessaged, setIsAnonymMessaged] = useState<boolean>(false);
  const [authPeriod, setAuthPeriod] = useState<number>(160);
  const [anonymPeriod, setAnonymPeriod] = useState<number>(160);
  const [authPeriodError, setAuthPeriodError] = useState<boolean>(false);
  const [anonymPeriodError, setAnonymPeriodError] = useState<boolean>(false);
  const [deletionTime, setDeletionTime] = useState<Date | undefined>();
  const [startDate, setStartDate] = useState<Date>(() => subDays(new Date(), -1));
  const [endDate, setEndDate] = useState<Date>(() => subDays(new Date(), -1));
  const [removableChatsCount, setremovableChatsCount] = useState<number>(0);
  const [authDate, setAuthDate] = useState<Date>(new Date());
  const [anonDate, setAnonDate] = useState<Date>(new Date());
  const [authDateStart, setAuthDateStart] = useState<Date>(new Date(0));
  const [anonDateStart, setAnonDateStart] = useState<Date>(new Date(0));

  useEffect(() => {
    setEndDate(subDays(new Date(), -1));
    if (deleteConfig) {
      setIsAnonymMessaged(deleteConfig.isAnonymConversations === 'true');
      setIsAuthMessages(deleteConfig.isAuthConversations === 'true');
      setAuthPeriod(Number(deleteConfig.authPeriod ?? 160));
      setAnonymPeriod(Number(deleteConfig.anonymPeriod ?? 160));
      setDeletionTime(
        deleteConfig?.deletionTimeISO === ''
          ? dateToLocalExcludingDST(new Date().toISOString())
          : dateToLocalExcludingDST(new Date(deleteConfig.deletionTimeISO).toISOString()),
      );
      reset(deleteConfig);
    }
  }, [deleteConfig]);

  useEffect(() => {
    const never = new Date(0);
    setAnonDate(isAnonymMessaged ? calculateDateFrom(anonymPeriod) : never);
    setAuthDate(isAuthMessaged ? calculateDateFrom(authPeriod) : never);
    setAuthDateStart(isAuthMessaged ? subDays(startDate, authPeriod) : never);
    setAnonDateStart(isAnonymMessaged ? subDays(startDate, anonymPeriod) : never);
  }, [endDate, startDate, isAnonymMessaged, isAuthMessaged, anonymPeriod, authPeriod]);

  useEffect(() => {
    getAllFutureRemovableChatsCount.mutate({
      authDate: authDate,
      anonDate: anonDate,
      authDateStart: authDateStart,
      anonDateStart: anonDateStart,
    });
  }, [authDate, anonDate, authDateStart, anonDateStart]);

  const getAllFutureRemovableChatsCount = useMutation({
    mutationFn: (data: { authDate: Date; anonDate: Date; authDateStart: Date; anonDateStart: Date }) => {
      return apiDev.post('agents/removable-count', {
        authDate: format(data.authDate, 'yyyy-MM-dd'),
        anonDate: format(data.anonDate, 'yyyy-MM-dd'),
        authDateStart: format(data.authDateStart, 'yyyy-MM-dd'),
        anonDateStart: format(data.anonDateStart, 'yyyy-MM-dd'),
      });
    },
    onSuccess: (res: any) => {
      setremovableChatsCount(res.data.response[0].totalCount);
    },
  });

  const setDeleteConversationsData = (data: DeleteChatSettings) => {
    return {
      ...data,
      isAnonymConversations: data.isAnonymConversations || false,
      isAuthConversations: data.isAuthConversations || false,
      anonymPeriod: data.anonymPeriod || 360,
      authPeriod: data.authPeriod || 360,
    };
  };

  const deleteSettingsMutation = useMutation({
    mutationFn: (data: DeleteChatSettings) =>
      apiDev.post<DeleteChatSettings>('configs/update-delete-messages-config', data),
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const cronUpdateMutation = useMutation({
    mutationFn: (data: { expression: string; anonEnabled: boolean; authEnabled: boolean }) =>
      apiDev.post<any>('internal/sync/delete-conversations-cron', data),
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const getCronExpression = (time: Date) => {
    const minutes = time.getMinutes();
    const hours = time.getHours();
    return `${minutes} ${hours} * * * ?`;
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    if (authPeriodError || anonymPeriodError) return;
    const timeDate = deletionTime ?? new Date();
    const expression = getCronExpression(timeDate);
    const saveData: DeleteChatSettings = {
      ...setDeleteConversationsData(data),
      deletionTimeISO: dateToUTCExcludingDST(timeDate.toISOString()),
    };
    try {
      await Promise.all([
        cronUpdateMutation.mutateAsync({ expression, anonEnabled: isAnonymMessaged, authEnabled: isAuthMessaged }),
        deleteSettingsMutation.mutateAsync(saveData),
      ]);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.updateSuccess'),
      });
    } catch {}
  });

  const handleDatesUpdate = (day: number) => {
    if (day === undefined) return;
    const resultDate = plusDays(new Date(), Number(day));
    const newEnd = new Date(resultDate.toISOString().split('T')[0]);
    setEndDate(newEnd);
    if (newEnd < startDate) setStartDate(newEnd);
  };

  if (isConfigLoading || !deleteConfig) {
    return <>Loading...</>;
  }

  return (
    <div className={'parent-container'}>
      <div className={'heading'}>
        <h1>{t('deleteConversation.conversationDeleting')}</h1>
        <p>{t('deleteConversation.expiringConversationsRules')}</p>
      </div>

      <Card
        isHeaderLight={true}
        isBodyDivided={true}
        isScrollable={true}
        footer={
          <Track justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={10} direction={'vertical'} align={'left'}>
          <Controller
            name="isAuthConversations"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('deleteConversation.authConversationsRemoval')}
                onLabel={t('global.yes') ?? 'yes'}
                offLabel={t('global.no') ?? 'no'}
                onCheckedChange={(value) => {
                  setIsAuthMessages(value);
                  field.onChange(value);
                }}
                checked={isAuthMessaged}
                tooltip={<InfoTooltip name="deleteConversation.tooltip.removeAuth" />}
                {...field}
              />
            )}
          />
          {isAuthMessaged && (
            <Controller
              name="authPeriod"
              control={control}
              render={({ field }) => (
                <Track justify={'start'} align={'left'} direction={'vertical'} isMultiline={true}>
                  <Track gap={3} align={'center'} justify={'start'} direction={'horizontal'}>
                    <FormInput
                      name="authPeriod"
                      label={t('deleteConversation.period')}
                      type="number"
                      min={0}
                      hideLabel={false}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        field.onChange(val);
                        setAuthPeriodError(val > 9999);
                        if (val <= 9999) setAuthPeriod(val);
                      }}
                      value={authPeriod}
                    />
                    <Track gap={10} justify={'start'} direction={'horizontal'}>
                      <label className="minute">{t('deleteConversation.days')}</label>
                      <InfoTooltip name="deleteConversation.tooltip.days" />
                    </Track>
                  </Track>
                  {authPeriodError && (
                    <label className="rule" style={{ color: 'red' }}>{t('deleteConversation.maxDaysError')}</label>
                  )}
                  <label className="rule">{t('deleteConversation.deletionAuthNote')}</label>
                </Track>
              )}
            />
          )}
        </Track>

        <Track gap={10} direction={'vertical'} align={'left'}>
          <Controller
            name="isAnonymConversations"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('deleteConversation.anonymConversationsDelete')}
                onLabel={t('global.yes') ?? 'yes'}
                offLabel={t('global.no') ?? 'no'}
                onCheckedChange={(value) => {
                  field.onChange(value);
                  setIsAnonymMessaged(value);
                }}
                checked={isAnonymMessaged}
                tooltip={<InfoTooltip name="deleteConversation.tooltip.removeAnon" />}
                {...field}
              />
            )}
          />
          {isAnonymMessaged && (
            <Controller
              name="anonymPeriod"
              control={control}
              render={({ field }) => (
                <Track justify={'start'} align={'left'} direction={'vertical'} isMultiline={true}>
                  <Track gap={3} align={'center'} justify={'start'} direction={'horizontal'}>
                    <FormInput
                      name="anonymPeriod"
                      label={t('deleteConversation.period')}
                      type="number"
                      min={0}
                      hideLabel={false}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        field.onChange(val);
                        setAnonymPeriodError(val > 9999);
                        if (val <= 9999) setAnonymPeriod(val);
                      }}
                      value={anonymPeriod}
                    />
                    <Track gap={10} align={'center'} justify={'start'} direction={'horizontal'}>
                      <label className="minute">{t('deleteConversation.days')}</label>
                      <InfoTooltip name="deleteConversation.tooltip.days" />
                    </Track>
                  </Track>
                  {anonymPeriodError && (
                    <label className="rule" style={{ color: 'red' }}>{t('deleteConversation.maxDaysError')}</label>
                  )}
                  <label className="rule">{t('deleteConversation.deletionAnonNote')}</label>
                </Track>
              )}
            />
          )}
        </Track>

        {(isAnonymMessaged || isAuthMessaged) && (
          <>
            <Controller
              name="deletionTimeISO"
              control={control}
              render={({ field }) => (
                <Track gap={100} justify={'start'} align={'center'} direction={'horizontal'} isMultiline={false}>
                  <Track gap={10} align={'center'} direction={'horizontal'}>
                    {t('deleteConversation.deletionTime')}
                  </Track>
                  <Track gap={10}>
                    <FormDatepicker
                      {...field}
                      label={t('deleteConversation.deletionTime')}
                      timePicker={true}
                      hideLabel
                      direction="row"
                      value={parse(format(new Date(deletionTime ?? new Date()), 'HH:mm:ss'), 'HH:mm:ss', new Date()) ?? new Date('0')}
                      onChange={(e) => {
                        setDeletionTime(e);
                        field.onChange(e);
                      }}
                    />
                    <InfoTooltip name="deleteConversation.tooltip.removalTime" />
                  </Track>
                </Track>
              )}
            />

            <Track gap={10} direction={'vertical'} align={'left'} justify={'between'}>
              <Track align={'center'}>
                <label>{t('deleteConversation.showExpiring')}</label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => {
                    return (
                      <div className="startTime">
                        <FormDatepicker
                          {...field}
                          label={t('global.startDate')}
                          timePicker={false}
                          hideLabel
                          direction="row"
                          value={startDate}
                          onChange={(val) => {
                            field.onChange(val);
                            setStartDate(val);
                            if (val > endDate) setEndDate(val);
                          }}
                        />
                      </div>
                    );
                  }}
                />
                <label>{t('settings.workingTime.until')}</label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => {
                    return (
                      <div className="endTime">
                        <FormDatepicker
                          {...field}
                          timePicker={false}
                          hideLabel
                          direction="row"
                          label=""
                          value={endDate ?? new Date()}
                          onChange={(val) => {
                            field.onChange(val);
                            setEndDate(val);
                            if (val < startDate) setStartDate(val);
                          }}
                        />
                      </div>
                    );
                  }}
                />
                <Track gap={8}>
                  <Button appearance={'text'} onClick={() => handleDatesUpdate(1)}>
                    {t('deleteConversation.oneDay')}
                  </Button>
                  <Button appearance={'text'} onClick={() => handleDatesUpdate(7)}>
                    {t('deleteConversation.sevenDays')}
                  </Button>
                  <Button appearance={'text'} onClick={() => handleDatesUpdate(31)}>
                    {t('deleteConversation.thirtyOneDay')}
                  </Button>
                  <Button appearance={'text'} onClick={() => handleDatesUpdate(90)}>
                    {t('deleteConversation.ninetyDays')}
                  </Button>
                  <InfoTooltip name="deleteConversation.tooltip.displayExpiringConversations" />
                </Track>
              </Track>
              <Track gap={40} align={'center'}>
                {t('deleteConversation.periodConversations')} <b>{removableChatsCount}</b>
              </Track>
              <DeletionChatOverview authDate={authDate} anonDate={anonDate} authDateStart={authDateStart} anonDateStart={anonDateStart} />
            </Track>
          </>
        )}
      </Card>
    </div>
  );
};

export default withAuthorization(DeleteConversations, [ROLES.ROLE_ADMINISTRATOR]);
