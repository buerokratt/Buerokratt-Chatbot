import {FC, useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {useMutation, useQuery} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {useTranslation} from 'react-i18next';
import {Button, Card, FormDatepicker, FormInput, Switch, Track} from 'components';
import {useToast} from 'hooks/useToast';
import {apiDev} from 'services/api';
import './DeleteConversations.scss';
import withAuthorization from 'hoc/with-authorization';
import {ROLES} from 'utils/constants';
import {DeleteChatSettings} from "../../../types/deleteChatSettings";
import {differenceInCalendarDays, format, parse, subDays} from "date-fns";
import DeletionChatOverview from "../../../components/DeletionChatOverview";

const DeleteConversations: FC = () => {
    const {t} = useTranslation();
    const toast = useToast();
    const {control, handleSubmit, reset} =
        useForm<DeleteChatSettings>(
            {
                mode: 'onChange',
                shouldUnregister: true,
            }
        );

    const {data: deleteConfig} = useQuery<DeleteChatSettings>({
        queryKey: ['configs/delete-conversation-config', 'prod'],
    });

    const plusDays = (date: Date, days: number): Date => {
        date.setDate(date.getDate() + days)
        return new Date(date.toISOString())
    }

    const calculateDateFrom = (daysForward: number): Date => {
        const today = new Date();
        if (!daysForward || daysForward === 0) return today;
        const differenceInDays = differenceInCalendarDays(today, endDate);
        const futureDate = daysForward + differenceInDays;
        return subDays(new Date(), futureDate);
    }

    const [isAuthMessaged, setIsAuthMessages] = useState<boolean>(false);
    const [isAnonymMessaged, setIsAnonymMessaged] = useState<boolean>(false);
    const [authPeriod, setAuthPeriod] = useState<number>(160);
    const [anonymPeriod, setAnonymPeriod] = useState<number>(160);
    const [deletionTime, setDeletionTime] = useState<string>();
    const startDate = plusDays(new Date(), 1);
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [removableChatsCount, setremovableChatsCount] = useState<number>(0);
    const [authDate, setAuthDate] = useState<Date>(new Date());
    const [anonDate, setAnonDate] = useState<Date>(new Date());

    useEffect(() => {
        setEndDate(new Date())
        if (deleteConfig) {
            setIsAnonymMessaged(deleteConfig.isAnonymConversations === 'true');
            setIsAuthMessages(deleteConfig.isAuthConversations === 'true');
            setAuthPeriod(Number(deleteConfig.authPeriod ?? 160));
            setAnonymPeriod(Number(deleteConfig.anonymPeriod ?? 160));
            setDeletionTime(deleteConfig?.deletionTimeISO === '' ? new Date().toISOString() : new Date(deleteConfig.deletionTimeISO).toISOString());
            reset(deleteConfig)
        }
    }, [deleteConfig]);

    useEffect(() => {
        const never = new Date(0);
        setAnonDate(isAnonymMessaged ? calculateDateFrom(anonymPeriod) : never);
        setAuthDate(isAuthMessaged ? calculateDateFrom(authPeriod) : never);
    }, [endDate, isAnonymMessaged, isAuthMessaged, anonymPeriod, authPeriod]);

    useEffect(() => {
        getAllFutureRemovableChatsCount.mutate({
            authDate: authDate,
            anonDate: anonDate,
        });
    }, [authDate, anonDate]);

    const getAllFutureRemovableChatsCount = useMutation({
        mutationFn: (data: {
            authDate: Date;
            anonDate: Date;
        }) => {
            return apiDev.post('agents/removable-count', {
                authDate: format(data.authDate, 'yyyy-MM-dd'),
                anonDate: format(data.anonDate, 'yyyy-MM-dd')
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
            deletionTimeISO: data.deletionTimeISO || new Date().toISOString()
        };
    }

    const deleteSettingsMutation = useMutation({
        mutationFn: (data: DeleteChatSettings) =>
            apiDev.post<DeleteChatSettings>(
                'configs/update-delete-messages-config',
                setDeleteConversationsData(data)
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

    const cronUpdateMutation = useMutation({
        mutationFn: (data: { expression: string, anonEnabled: boolean, authEnabled: boolean }) =>
            apiDev.post<any>(
                'internal/sync/delete-conversations-cron',
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

    })

    const getCronExpression = (deletionTime: Date) => {
        const minutes = deletionTime.getMinutes();
        const hours = deletionTime.getHours();

        return `${minutes} ${hours} * * * ?`;
    }

    const handleFormSubmit = handleSubmit((data) => {
        const expression = getCronExpression(new Date(data.deletionTimeISO));
        cronUpdateMutation.mutate({expression, anonEnabled: isAnonymMessaged, authEnabled: isAuthMessaged});
        deleteSettingsMutation.mutate(data);
    });

    const handleDatesUpdate = (day: number) => {
        if (day === undefined) return;
        const resultDate = plusDays(new Date(), day)
        setEndDate(new Date(resultDate.toISOString().split('T')[0]));
    }

    if (!deleteConfig) {
        return <>Loading...</>;
    }

    return (
        <div className={'parent-container'}>
            <div className={"heading"}>
                <h1>{t('deleteConversation.conversationDeleting')}</h1>
                <p>{t('deleteConversation.expiringConversationsRules')}</p>
            </div>

            <Card
                isHeaderLight={true}
                isBodyDivided={true}
                footer={
                    <Track justify="end">
                        <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
                    </Track>
                }
            >
                <Track gap={10} direction={"vertical"} align={"left"}>
                    <Controller
                        name="isAuthConversations"
                        control={control}
                        render={({field}) => (
                            <Switch
                                label={t('deleteConversation.authConversationsRemoval')}
                                onLabel={t('global.yes') ?? 'yes'}
                                offLabel={t('global.no') ?? 'no'}
                                onCheckedChange={(value) => {
                                    setIsAuthMessages(value)
                                    field.onChange(value)
                                }}
                                checked={isAuthMessaged}
                                {...field}
                            />
                        )}
                    />
                    {isAuthMessaged && (
                        <Controller
                            name="authPeriod"
                            control={control}
                            render={({field}) => (
                                <Track justify={"start"} align={"left"} direction={"vertical"} isMultiline={true}>
                                    <Track gap={3} align={"center"} justify={"start"} direction={"horizontal"}>
                                        <FormInput
                                            name="authPeriod"
                                            label={t('deleteConversation.period')}
                                            type="number"
                                            hideLabel={false}
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                                setAuthPeriod(e.target.value)
                                            }
                                            }
                                            value={authPeriod}
                                        />
                                        <label className="minute">
                                            {t('deleteConversation.days')}
                                        </label>
                                    </Track>
                                    <label className="rule">
                                        {t('deleteConversation.deletionNote')}
                                    </label>
                                </Track>
                            )}
                        />
                    )}
                </Track>

                <Track gap={10} direction={"vertical"} align={"left"}>
                    <Controller
                        name="isAnonymConversations"
                        control={control}
                        render={({field}) => (
                            <Switch
                                label={t('deleteConversation.anonymConversationsDelete')}
                                onLabel={t('global.yes') ?? 'yes'}
                                offLabel={t('global.no') ?? 'no'}
                                onCheckedChange={(value) => {
                                    field.onChange(value)
                                    setIsAnonymMessaged(value)
                                }
                                }
                                checked={isAnonymMessaged}
                                {...field}
                            />
                        )}
                    />
                    {isAnonymMessaged && (
                        <Controller
                            name="anonymPeriod"
                            control={control}
                            render={({field}) => (
                                <Track justify={"start"} align={"left"} direction={"vertical"} isMultiline={true}>
                                    <Track gap={3} align={"center"} justify={"start"} direction={"horizontal"}>
                                        <FormInput
                                            name="anonymPeriod"
                                            label={t('deleteConversation.period')}
                                            type="number"
                                            hideLabel={false}
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                                setAnonymPeriod(e.target.value)
                                            }}
                                            value={anonymPeriod}
                                        />
                                        <label className="minute">
                                            {t('deleteConversation.days')}
                                        </label>
                                    </Track>
                                    <label className="rule">
                                        {t('deleteConversation.deletionNote')}
                                    </label>
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
                            render={({field}) => (
                                <Track gap={100} justify={"start"} align={"center"} direction={"horizontal"}
                                       isMultiline={false}>
                                    <Track gap={10} align={"center"} direction={"horizontal"}>
                                        {t('deleteConversation.deletionTime')}
                                    </Track>
                                    <Track>
                                        <FormDatepicker
                                            {...field}
                                            label={t('deleteConversation.deletionTime')}
                                            timePicker={true}
                                            hideLabel
                                            direction="row"
                                            value={
                                                parse(
                                                    format(new Date(deletionTime), 'HH:mm:ss'),
                                                    'HH:mm:ss',
                                                    new Date()
                                                ) ?? new Date('0')
                                            }
                                            onChange={(e) => {
                                                setDeletionTime(e)
                                                field.onChange(e)
                                            }}
                                        />
                                    </Track>
                                </Track>
                            )}
                        />

                        <Track gap={10} direction={"vertical"} align={"left"} justify={"between"}>
                            <Track align={"center"}>
                                <label>{t('deleteConversation.showExpiring')}</label>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({field}) => {
                                        return (
                                            <div className="startTime">
                                                <FormDatepicker
                                                    {...field}
                                                    label={t('global.startDate')}
                                                    timePicker={false}
                                                    disabled={true}
                                                    hideLabel
                                                    direction="row"
                                                    value={startDate}
                                                />
                                            </div>
                                        );
                                    }}
                                />
                                <label>{t('settings.workingTime.until')}</label>
                                <Controller
                                    name='endDate'
                                    control={control}
                                    render={({field}) => {
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
                                                        field.onChange(val)
                                                        setEndDate(val)
                                                    }}
                                                />

                                            </div>
                                        );
                                    }}
                                />
                                <Track gap={8}>
                                    <Button appearance={"text"}
                                            onClick={() => handleDatesUpdate(1)}>{t('deleteConversation.oneDay')}</Button>
                                    <Button appearance={"text"}
                                            onClick={() => handleDatesUpdate(7)}>{t('deleteConversation.sevenDays')}</Button>
                                    <Button appearance={"text"}
                                            onClick={() => handleDatesUpdate(31)}>{t('deleteConversation.thirtyOneDay')}</Button>
                                    <Button appearance={"text"}
                                            onClick={() => handleDatesUpdate(90)}>{t('deleteConversation.ninetyDays')}</Button>
                                </Track>
                            </Track>
                            <Track gap={40} align={"center"}>
                                {t('deleteConversation.periodConversations')} <b>{removableChatsCount}</b>
                            </Track>
                            <DeletionChatOverview authDate={authDate} anonDate={anonDate}></DeletionChatOverview>
                        </Track>
                    </>
                )}
            </Card>
        </div>
    );
};

export default withAuthorization(DeleteConversations, [ROLES.ROLE_ADMINISTRATOR]);