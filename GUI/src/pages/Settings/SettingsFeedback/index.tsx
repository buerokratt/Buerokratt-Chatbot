import { FEEDBACK_NOTICE_LENGTH, FEEDBACK_QUESTION_LENGTH } from 'constants/config';

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Button, Card, FormRadios, FormTextarea, Switch, Track } from 'components';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { apiDev } from 'services/api';
import { FeedbackConfig } from 'types/feedbackConfig';
import { ROLES } from 'utils/constants';

import { getFeedbackConfigData, setFeedbackData } from './data';
import { useDomainSelectionHandler } from '../../../hooks/useDomainSelectionHandler';
import DomainSelector from '../../../components/DomainsSelector';
import { fetchConfigurationFromDomain } from '../../../services/configurations';

const SettingsFeedback: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { control, handleSubmit, reset } = useForm<FeedbackConfig>();
  const [feedbackConfig, setFeedbackConfig] = useState<FeedbackConfig | undefined>(undefined);
  const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  useEffect(() => {
    resetSettingsToDefault();
    if (multiDomainEnabled) {
      resetSettingsToDefault();
    } else {
      fetchData('none');
    }
  }, []);

  const fetchData = async (selectedDomain: string) => {
    try {
      const data: { response: FeedbackConfig } = await fetchConfigurationFromDomain<{ response: FeedbackConfig }>(
        'configs/feedback',
        selectedDomain,
      );
      const res = data.response;
      reset(res);
      setFeedbackConfig(getFeedbackConfigData(res));
    } catch (error) {
      console.error('Failed to fetch feedback', error);
    }
  };

  const feedbackConfigMutation = useMutation({
    mutationFn: (data: FeedbackConfig) => apiDev.post<FeedbackConfig>('configs/feedback', setFeedbackData(data)),
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
    feedbackConfigMutation.mutate(data);
  });

  const resetSettingsToDefault = () => {
    const feedbackConfig = {
      feedbackActive: false,
      feedbackQuestion: '',
      feedbackNoticeActive: false,
      isFiveRatingScale: undefined,
      feedbackNotice: ''
    };
    setFeedbackConfig(feedbackConfig);
    reset(feedbackConfig);
  };

  const handleDomainSelection = useDomainSelectionHandler(setSelectedDomains, fetchData, resetSettingsToDefault);

  if (!feedbackConfig) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>{t('settings.feedback.title')}</h1>

      {multiDomainEnabled && (
        <DomainSelector
          disabled={(multiDomainEnabled && selectedDomains.length === 0) || false}
          onChange={(selected) => {
            handleDomainSelection(selected);
          }}
        />
      )}

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
                checked={Boolean(field.value)}
                {...field}
              />
            )}
          />
          <Controller
            name="isFiveRatingScale"
            control={control}
            render={({ field }) => {
              return (
                <FormRadios
                  label={t('settings.feedback.feedbackScale')}
                  name={field.name}
                  items={[
                    {
                      label: t('settings.feedback.tenPoints'),
                      value: 'false',
                    },
                    {
                      label: t('settings.feedback.fivePoints'),
                      value: 'true',
                    },
                  ]}
                  onChange={(value) => {
                    field.onChange(value === 'true');
                  }}
                  value={field.value?.toString() ?? undefined}
                />
              );
            }}
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
                defaultValue={field.value ?? ''}
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
                checked={Boolean(field.value)}
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
                defaultValue={field.value ?? ''}
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

export default withAuthorization(SettingsFeedback, [ROLES.ROLE_ADMINISTRATOR]);
