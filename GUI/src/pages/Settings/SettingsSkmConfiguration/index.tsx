import { FC, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  FormInput,
  FormSelect,
  FormTextarea,
  Icon,
  Tooltip,
  Track,
} from 'components';
import { useMutation } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { SkmConfig } from 'types/skmConfig';
import { Controller, useForm } from 'react-hook-form';
import { getQueryTypes } from './data';

const SettingsSkmConfiguration: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { control, handleSubmit, reset } =
    useForm<SkmConfig>();
  const [key, setKey] = useState(0);
  const [skmConfig, setSkmConfig] = useState<SkmConfig | undefined>(undefined);

  const getSkmConfig = async () => {
    const res = await apiDev.get<{response: SkmConfig}>('configs/skm-config');
    reset(res.data.response);
    setSkmConfig(res.data.response);
    setKey(key + 1);
  }

  useEffect(() => {
   getSkmConfig();
  }, []);

  const skmConfigMutation = useMutation({
    mutationFn: (data: SkmConfig) =>
      apiDev.post<SkmConfig>('configs/skm-config', {
        ...data,
        range: data.range.toString(),
        documents: data.documents.toString(),
        maxTokens: data.maxTokens.toString(),
      }),
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
    const validationMessage = isValid(data);
    if (validationMessage === '') {
      skmConfigMutation.mutate(data);
    } else {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: validationMessage,
      });
    }
  });

  const isValid = (data: SkmConfig) => {
    const range = parseInt(data.range ?? '3');
    const documents = parseInt(data.documents ?? '5');
    const maxTokens = parseInt(data.maxTokens ?? '1000');
    const systemMessage = data.systemMessage;
    if (range < 1 || range > 5) {
      return t('settings.skmConfiguration.validation.range');
    } else if (documents < 1 || documents > 20) {
      return t('settings.skmConfiguration.validation.documents');
    } else if (maxTokens < 1 || maxTokens > 2000) {
      return t('settings.skmConfiguration.validation.maxTokens');
    } else if (systemMessage.length < 1) {
      return t('settings.skmConfiguration.validation.systemMessage');
    } else {
      return '';
    }
  };

  const tooltips = {
    range: t('settings.skmConfiguration.tooltip.range'),
    documents: t('settings.skmConfiguration.tooltip.documents'),
    systemMessage: t('settings.skmConfiguration.tooltip.systemMessage'),
    maxTokens: t('settings.skmConfiguration.tooltip.maxTokens'),
    indexName: t('settings.skmConfiguration.tooltip.indexName'),
    queryType: t('settings.skmConfiguration.tooltip.queryType'),
    semanticConfiguration: t('settings.skmConfiguration.tooltip.semanticConfiguration'),
  };

  if (!skmConfig) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>{t('settings.skmConfiguration.title')}</h1>
      <p>{t('settings.skmConfiguration.description')}</p>
      <Card
        key={key}
        footer={
          <Track justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={16} direction="vertical" align="left">
          {getNumberControl('range')}
          {getNumberControl('documents')}
          <Controller
            name="systemMessage"
            control={control}
            render={({ field }) => (
              <Track gap={10} style={{ width: '100%' }}>
                <FormTextarea
                  label={t('settings.skmConfiguration.systemMessage')}
                  maxLength={-1}
                  onChange={field.onChange}
                  defaultValue={field.value}
                  name="label"
                  useRichText
                />
                {getTooltip('systemMessage')}
              </Track>
            )}
          />
          {getNumberControl('maxTokens')}
          {getTextControl('indexName')}
          {getTextControl('semanticConfiguration')}
          <Controller
            name="queryType"
            control={control}
            render={({ field }) => (
              <Track gap={10} style={{ width: '100%' }}>
                <FormSelect
                  {...field}
                  onSelectionChange={(selection) =>
                    field.onChange(selection?.value)
                  }
                  label={t('settings.skmConfiguration.queryType')}
                  defaultValue={field.value}
                  options={getQueryTypes()}
                />
                {getTooltip('queryType')}
              </Track>
            )}
          />
        </Track>
      </Card>
    </>
  );

  function getTooltip(name: 'range' | 'documents' | 'systemMessage' | 'maxTokens' | 'indexName' | 'queryType' | 'semanticConfiguration') {
    return (
      <Tooltip content={tooltips[name]}>
        <span>
          <Icon
            icon={<AiOutlineInfoCircle fontSize={20} color="#005aa3" />}
            size="medium"
          />
        </span>
      </Tooltip>
    );
  }

  function getNumberControl(
    name: 'systemMessage' | 'range' | 'documents' | 'maxTokens'
  ) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Track gap={10}>
            <FormInput
              name={name}
              label={t(`settings.skmConfiguration.${name}`)}
              type="number"
              onChange={field.onChange}
              value={field.value}
            />
            {getTooltip(name)}
          </Track>
        )}
      />
    );
  }

  function getTextControl(
    name: 'indexName' | 'semanticConfiguration'
  ) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Track gap={10} style={{ width: '100%' }}>
            <FormInput
              name="indexName"
              label={t(`settings.skmConfiguration.${name}`)}
              onChange={field.onChange}
              value={field.value}
            />
            {getTooltip(name)}
          </Track>
        )}
      />
    );
  }
};

export default withAuthorization(SettingsSkmConfiguration, [
  ROLES.ROLE_ADMINISTRATOR,
]);
