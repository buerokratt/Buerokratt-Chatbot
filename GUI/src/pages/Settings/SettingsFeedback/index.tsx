import { FC, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Card,
  FormTextarea,
  Switch,
  Track,
} from 'components';
import {
  FEEDBACK_QUESTION_LENGTH,
  FEEDBACK_NOTICE_LENGTH,
} from 'constants/config';
import { useMutation } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { FeedbackConfig } from 'types/feedbackConfig';
import { getFeedbackConfigData, setFeedbackData } from './data';

const SettingsFeedback: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { control, handleSubmit, reset } = useForm<FeedbackConfig>();
  const [key, setKey] = useState(0);
  const [feedbackConfig, setFeedbackConfig] = useState<FeedbackConfig | undefined>(undefined);

  const getFeedbackConfig = async () => {
      const res = await apiDev.get<{response: FeedbackConfig}>('configs/feedback');
      reset(getFeedbackConfigData(res.data.response));
      setFeedbackConfig(res.data.response);
      setKey(key + 1);
    }
  
    useEffect(() => {
      getFeedbackConfig();
    }, []);

    const feedbackConfigMutation = useMutation({
      mutationFn: (data: FeedbackConfig) =>
        apiDev.post<FeedbackConfig>(
          'configs/feedback',
          setFeedbackData(data)
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
      feedbackConfigMutation.mutate(data);
    });

    if (!feedbackConfig) {
      return <>Loading...</>;
    }

  return (
    <>
      <h1>{t('settings.feedback.title')}</h1>
      <Card
        footer={
          <Track justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={16} direction="vertical" align="left">
          <Controller
            name="feedbackActive"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('settings.feedback.feedbackActive')}
                onCheckedChange={field.onChange}
                checked={field.value}
                {...field}
              />
            )}
          />
          <Controller
            name="feedbackQuestion"
            control={control}
            render={({ field }) => (
              <FormTextarea
                label={t('settings.feedback.feedbackQuestion')}
                minRows={4}
                maxLength={FEEDBACK_QUESTION_LENGTH}
                onChange={field.onChange}
                defaultValue={field.value}
                name="label"
                showMaxLength
                maxLengthBottom
                useRichText
              />
            )}
          />
          <Controller
            name="feedbackNoticeActive"
            control={control}
            render={({ field }) => (
              <Switch
                label={t('settings.feedback.noticeActive')}
                onCheckedChange={field.onChange}
                checked={field.value}
                {...field}
              />
            )}
          />
          <Controller
            name="feedbackNotice"
            control={control}
            render={({ field }) => (
              <FormTextarea
                label={t('settings.feedback.notice')}
                minRows={4}
                maxLength={FEEDBACK_NOTICE_LENGTH}
                onChange={field.onChange}
                defaultValue={field.value}
                name="label"
                showMaxLength
                maxLengthBottom
                useRichText
              />
            )}
          />
        </Track>
      </Card>
    </>
  );
};

export default withAuthorization(SettingsFeedback, [
  ROLES.ROLE_ADMINISTRATOR,
]);
