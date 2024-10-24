import { FC, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { format, parse } from 'date-fns';
import {Button, Card, FormDatepicker, FormInput, Section, Switch, Track} from 'components';
import { OrganizationWorkingTime } from 'types/organizationWorkingTime';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import './DeleteChat.scss';
import { getOrganizationTimeData, setOrganizationTimeData } from '../SettingsWorkingTime/data';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import {DeleteChatSettings} from "../../../types/deleteChatSettings";

const DeleteChat: FC = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { control, handleSubmit, reset, watch } =
        useForm<DeleteChatSettings>();
    const [key, setKey] = useState(0);
    const isOrganizationClosedOnWeekEnds = watch('organizationClosedOnWeekEnds');
    const isOrganizationTheSameOnAllWorkingDays = watch(
        'organizationTheSameOnAllWorkingDays'
    );
    const isAuthConversation = watch(
        'authConversations'
    );
    const { data: workingTime } = useQuery<OrganizationWorkingTime>({
        queryKey: ['configs/organization-working-time', 'prod'],
        onSuccess: (data: any) => {
            if (Object.keys(control._formValues).length > 0) return;
            reset(getOrganizationTimeData(data.response));
            setKey(key + 1);
        },
    });

    const [isAuthMessaged, setIsAuthMessages] = useState<boolean>(false);
    const [isAnonymMessaged, setIsAnonymMessaged] = useState<boolean>(false);
    const [sessionLength, setSessionLength] = useState<string>('');

    const handleAuth = (value) => {
        setIsAuthMessages(value)
    }

    const handleAnonym = (value) => {
        setIsAnonymMessaged(value)
    }

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

    return (
        <>
            <div className={"heading"}>
                <h1>{t('deleteConversation.conversationDeleting')}</h1>
                <p>{t('deleteConversation.expiringConversationsRules')}</p>
            </div>

            <Card
                key={key}
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
                            name="authConversations"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    label={t('deleteConversation.authConversationsRemoval')}
                                    onLabel="yes"
                                    offLabel="no"
                                    onCheckedChange={(value) => handleAuth(value)}
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
                                    <Track justify={"start"} align={"left"}  direction={"vertical"} isMultiline={true}>
                                        <Track gap={3} align={"center"} justify={"start"} direction={"horizontal"}>
                                            <FormInput
                                                name="authNumber"
                                                label={t('deleteConversation.period')}
                                                type="number"
                                                hideLabel={false}
                                                onChange={(e) => setSessionLength(e.target.value)}
                                                value={12}
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

                {/*SECOND BLOCK*/}
                <Track gap={10} direction={"vertical"} align={"left"}>
                    <Controller
                        name="authConversations"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                label={t('deleteConversation.anonymConversationsDelete')}
                                onLabel="yes"
                                offLabel="no"
                                onCheckedChange={(value) => handleAnonym(value)}
                                checked={isAnonymMessaged}
                                {...field}
                            />
                        )}
                    />
                    {isAnonymMessaged && (
                        <Controller
                            name="authPeriod"
                            control={control}
                            render={({field}) => (
                                <Track justify={"start"} align={"left"}  direction={"vertical"} isMultiline={true}>
                                    <Track gap={3} align={"center"} justify={"start"} direction={"horizontal"}>
                                        <FormInput
                                            name="authNumber"
                                            label={t('deleteConversation.period')}
                                            type="number"
                                            hideLabel={false}
                                            onChange={(e) => setSessionLength(e.target.value)}
                                            value={12}
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


                {/* REST OF PAGE */}

                {(isAnonymMessaged || isAuthMessaged) && (
                    <>
                        <Controller
                            name="authPeriod"
                            control={control}
                            render={({field}) => (
                                <Track gap={100} justify={"start"} align={"center"} direction={"horizontal"} isMultiline={false}>
                                    <Track gap={10} align={"center"} direction={"horizontal"}>
                                        {t('deleteConversation.deletionTime')}
                                    </Track>
                                    <Track>
                                        <FormDatepicker
                                            {...field}
                                            timePicker
                                            hideLabel
                                            direction="row"
                                            value={new Date('0')}
                                        />
                                    </Track>
                                </Track>
                            )}
                        />

                        <Track gap={10} direction={"vertical"} align={"left"} justify={"between"}>
                        <Track align={"center"}>
                            <label>{t('deleteConversation.showExpiring')}</label>
                            <Controller
                                name={'organizationAllWeekdaysTimeStartISO'}
                                control={control}
                                render={({field}) => {
                                    return (
                                        <div className="startTime">
                                            <FormDatepicker
                                                {...field}
                                                datePicker
                                                hideLabel
                                                direction="row"
                                                label="123"
                                                value={
                                                    parse(
                                                        format(field.value as Date, 'HH:mm:ss'),
                                                        'HH:mm:ss',
                                                        new Date()
                                                    ) ?? new Date('0')
                                                }
                                            />
                                        </div>
                                    );
                                }}
                            />
                            <label>{t('settings.workingTime.until')}</label>
                            <Controller
                                name={'organizationAllWeekdaysTimeEndISO'}
                                control={control}
                                render={({field}) => {
                                    return (
                                        <div className="endTime">
                                            <FormDatepicker
                                                {...field}
                                                datePicker
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
                                            />

                                        </div>
                                    );
                                }}
                            />
                            <Track gap={8}>
                                <Button appearance={"text"} onClick={handleFormSubmit}>{t('deleteConversation.oneDay')}</Button>
                                <Button appearance={"text"} onClick={handleFormSubmit}>{t('deleteConversation.sevenDays')}</Button>
                                <Button appearance={"text"} onClick={handleFormSubmit}>{t('deleteConversation.thirtyOneDay')}</Button>
                                <Button appearance={"text"} onClick={handleFormSubmit}>{t('deleteConversation.ninetyDays')}</Button>
                            </Track>
                        </Track>
                        <Track gap={40} align={"center"}>
                            {t('deleteConversation.periodConversations')} <b>69483</b>
                            <Track justify="end">
                                <Button appearance={"secondary"} onClick={handleFormSubmit}>{t('deleteConversation.generateCsv')}</Button>
                            </Track>
                        </Track>
                        </Track>
                    </>
                )}
            </Card>
        </>
    );
};

export default withAuthorization(DeleteChat, [ROLES.ROLE_ADMINISTRATOR]);
