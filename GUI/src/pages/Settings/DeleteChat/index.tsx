import { FC, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { format, parse } from 'date-fns';
import { Button, Card, FormDatepicker, Switch, Track } from 'components';
import { OrganizationWorkingTime } from 'types/organizationWorkingTime';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import '../SettingsWorkingTime/SettingsWorkingTime.scss';
import { getOrganizationTimeData, setOrganizationTimeData } from '../SettingsWorkingTime/data';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';

const weekdaysOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const DeleteChat: FC = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { control, handleSubmit, reset, watch } =
        useForm<OrganizationWorkingTime>();
    const [key, setKey] = useState(0);
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

    return (
        <>
            <h1>{t('settings.workingTime.title')}</h1>
            <p>{t('settings.workingTime.description')}</p>
            <Card
                key={key}
                isHeaderLight={true}
                isBodyDivided={true}
                footer={
                    <Track justify="end">
                        <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
                    </Track>
                }
                header={
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
                    </Track>
                }
            >
                {isOrganizationTheSameOnAllWorkingDays && (
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
                                        />
                                    </div>
                                );
                            }}
                        />
                    </Track>
                )}
                {!isOrganizationTheSameOnAllWorkingDays &&
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
                                                        />
                                                    </div>
                                                );
                                            }}
                                        />
                                    </Track>
                                )}
                            </Track>
                        ))}
            </Card>
        </>
    );
};

export default withAuthorization(DeleteChat, [ROLES.ROLE_ADMINISTRATOR]);
