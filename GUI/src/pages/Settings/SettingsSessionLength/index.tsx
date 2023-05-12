import { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import { Button, Card, FormDatepicker, FormTextarea, Switch, Track } from 'components';
import { EMERGENCY_NOTICE_LENGTH } from 'constants/config';
import { EmergencyNotice } from 'types/emergencyNotice';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import api from 'services/api';

const SettingsSessionLength: FC = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { register, control, handleSubmit, reset } = useForm<EmergencyNotice>();
    const { data: emergencyNotice } = useQuery<EmergencyNotice>({
        queryKey: ['cs-get-emergency-notice'],
        onSuccess: (data) => reset({
            emergencyNoticeStartISO: new Date(data.emergencyNoticeStartISO),
            emergencyNoticeEndISO: new Date(data.emergencyNoticeEndISO),
        }),
    });

    const emergencyNoticeMutation = useMutation({
        mutationFn: (data: EmergencyNotice) => api.post<EmergencyNotice>('cs-set-emergency-notice', data),
        onError: (error: AxiosError) => {
            toast.open({
                type: 'error',
                title: t('global.notificationError'),
                message: error.message,
            });
        },
    });

    const handleFormSubmit = handleSubmit((data) => {
        emergencyNoticeMutation.mutate(data);
    });

    if (!emergencyNotice) return <>Loading...</>;

    return (
        <>
            <h1>{t('settings.emergencyNotices.title')}</h1>
            <Card
                footer={
                    <Track justify='end'>
                        <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
                    </Track>
                }
            >
                <Track gap={16} direction='vertical' align='left'>
                    <Controller name='isEmergencyNoticeVisible' control={control} render={({ field }) =>
                        <Switch
                            checked={emergencyNotice.isEmergencyNoticeVisible}
                            label={t('settings.emergencyNotices.noticeActive')}
                            {...field}
                        />
                    }
                    />
                    <FormTextarea
                        {...register('emergencyNoticeText')}
                        label={t('settings.emergencyNotices.notice')}
                        minRows={1}
                        maxLength={EMERGENCY_NOTICE_LENGTH}
                        defaultValue={emergencyNotice.emergencyNoticeText}
                        showMaxLength
                    />
                </Track>
            </Card >
        </>
    );
};

export default SettingsSessionLength;
