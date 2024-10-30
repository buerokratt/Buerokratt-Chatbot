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
import {format, parse} from "date-fns";
import ChatHistory from "../../Chat/ChatHistory";
import ChatOverview from "../../../components/ChatOverview";

const DeleteConversations: FC = () => {
    const {t} = useTranslation();
    const toast = useToast();
    const {control, handleSubmit, reset,getValues} =
        useForm<DeleteChatSettings>(
            {
                mode: 'onChange',
                shouldUnregister: true,
            }
        );

    const {data: deleteConfig} = useQuery<DeleteChatSettings>({
        queryKey: ['configs/delete-conversation-config', 'prod'],
    });

    const [isAuthMessaged, setIsAuthMessages] = useState<boolean>(false);
    const [isAnonymMessaged, setIsAnonymMessaged] = useState<boolean>(false);
    const [authPeriod, setAuthPeriod] = useState<number>(30);
    const [anonymPeriod, setAnonymPeriod] = useState<number>(30);
    const [deletionTime, setDeletionTime] = useState<string>();
    const [startDate, setStartDate] = useState<Date | string>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [removableChats, setRemovableChats] = useState<number>(0);

    useEffect(() => {
        setEndDate(new Date())
        setStartDate(new Date())
        if (deleteConfig) {
            setIsAnonymMessaged(deleteConfig.isAnonymConversations ?? false);
            setIsAuthMessages(deleteConfig.isAuthConversations ?? false);
            setAuthPeriod(deleteConfig.authPeriod ?? 0);
            setAnonymPeriod(deleteConfig.anonymPeriod ?? 0);
            setDeletionTime(deleteConfig.deletionTimeISO);
            reset(deleteConfig)
        }
    }, [deleteConfig]);

    const setDeleteConversationsData = (data: DeleteChatSettings)=> {
        return {
            ...data,
            isAnonymConversations: data.isAnonymConversations,
            isAuthConversations: data.isAuthConversations,
            anonymPeriod: data.anonymPeriod,
            authPeriod: data.authPeriod,
            deletionTimeISO: data.deletionTimeISO
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
        mutationFn: (data: {expression: string})=>
            apiDev.post<any>(
                'internal/sync/delete-conversation-cron',
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

    const getCronExpression = (deletionTime: string) => {
        // const minutes = date.getMinutes();
        // const hours = date.getHours();

        // return `${minutes} ${hours} * * *`;
        return '';
    }

    const handleFormSubmit = handleSubmit((data) => {
        // const expression = getCronExpression(data.deletionTimeISO);
        // cronUpdateMutation.mutate({expression});
        // deleteSettingsMutation.mutate(data);
        console.log('date type', typeof  data.deletionTimeISO, data.deletionTimeISO)
    });

    const handleDatesUpdate = (day: number) => {
        const today = new Date();
        today.setDate(today.getDate() - day);
        setStartDate(new Date(today.toISOString().split('T')[0]));
        apiDev.post<any>('chats/chat-to-remove',{fromDate: new Date(startDate), untilDate: new Date(endDate)}).then(
            (res) => {
                console.log('result',res);
                if(res){
                    console.log(res.data.response.length ?? 0)
                    setRemovableChats(res.data.response.length ?? 0)
                }
            }
        )
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
                                                setAuthPeriod(e.target.value)}
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
                                    setIsAnonymMessaged(value)}
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
                                                    format(new Date(field.value), 'HH:mm:ss'),
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
                                                    hideLabel
                                                    direction="row"
                                                    value={startDate ?? new Date()}
                                                    onChange={(val) => {
                                                        field.onChange(val)
                                                        setStartDate(val)
                                                    }}
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
                                {t('deleteConversation.periodConversations')} <b>{ removableChats }</b>
                            </Track>
                            <ChatOverview fromDate={startDate.toString()} untilDate={endDate.toString()}></ChatOverview>
                        </Track>
                    </>
                )}
            </Card>
        </div>
    );
};

export default withAuthorization(DeleteConversations, [ROLES.ROLE_ADMINISTRATOR]);
