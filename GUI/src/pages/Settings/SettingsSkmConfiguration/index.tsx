import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Button, Card, FormInput, FormSelect, FormTextarea, Icon, Switch, Tooltip, Track } from 'components';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, Fragment, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { apiDev } from 'services/api';
import { SkmConfig, SkmConfigResponse } from 'types/skmConfig';
import { ROLES } from 'utils/constants';

import { getQueryTypes } from './data';
import DomainTabSelector from '../../../components/DomainTabSelector';
import DomainTransfer from '../../../components/DomainTransfer';
import { useDomainSelectionHandler } from '../../../hooks/useDomainSelectionHandler';
import { fetchConfigurationFromDomain } from '../../../services/configurations';
import useStore from '../../../store';

import { SelectOption } from 'types';

const SettingsSkmConfiguration: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { control, handleSubmit, reset, watch } = useForm<SkmConfig>();
  const useAgentic = watch('useAgentic');
  const [key, setKey] = useState(0);
  const [skmConfig, setSkmConfig] = useState<SkmConfig | undefined>(undefined);
  const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const rawDomains = useStore((state) => state.allDomains);
  const domainOptions: SelectOption[] = rawDomains.map((d) => ({ label: d.name, value: d.id }));

  useEffect(() => {
    if (multiDomainEnabled) {
      resetSettingsToDefault();
    } else {
      fetchData('none');
    }
  }, []);

  const fetchData = async (selectedDomain: string) => {
    try {
      const data: SkmConfigResponse = await fetchConfigurationFromDomain<SkmConfigResponse>(
        'configs/skm-config',
        selectedDomain,
      );
      const res = { ...data.response, azureClientSecret: '' };

      reset(res);
      setSkmConfig(res);
      setKey(key + 1);
    } catch (error) {
      console.error('Failed to fetch emergency notice', error);
    }
  };

  const skmConfigMutation = useMutation({
    mutationFn: (data: SkmConfig) => {
      const { azureClientSecret: _azureClientSecret, ...body } = data;
      return apiDev.post<SkmConfig>('configs/skm-config', {
        ...body,
        range: data.range.toString(),
        documents: data.documents.toString(),
        maxTokens: data.maxTokens.toString(),
        inScope: data.inScope.toString(),
        useAgentic: data.useAgentic.toString(),
        azureAgenticMaxOutputTokens: data.azureAgenticMaxOutputTokens?.toString(),
      });
    },
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

  const syncClientSecret = async (data: SkmConfig) => {
    if (data.useAgentic !== 'true') {
      return;
    }
    const domains = data.domainUUID ?? [];
    if (domains.length > 1) {
      await Promise.all(domains.map((id) => apiDev.post('configs/skm-config/secret', { domain: id, secret: '' })));
      return;
    }
    if (!data.azureClientSecret) {
      return;
    }
    const domain = domains.length === 1 ? domains[0] : 'none';
    await apiDev.post('configs/skm-config/secret', { domain, secret: data.azureClientSecret });
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    const validationMessage = isValid(data);
    if (validationMessage === '') {
      data.domainUUID = multiDomainEnabled ? selectedDomains : [];
      try {
        await skmConfigMutation.mutateAsync(data);
        await syncClientSecret(data);
      } catch {
        // Failure toast already shown by skmConfigMutation.onError
      }
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
    inScope: t('settings.skmConfiguration.tooltip.inScope'),
    useAgentic: t('settings.skmConfiguration.tooltip.useAgentic'),
    azureAgentName: t('settings.skmConfiguration.tooltip.azureAgentName'),
    azureAgentType: t('settings.skmConfiguration.tooltip.azureAgentType'),
    azureClientId: t('settings.skmConfiguration.tooltip.azureClientId'),
    azureClientSecret: t('settings.skmConfiguration.tooltip.azureClientSecret'),
    azureAgenticMaxOutputTokens: t('settings.skmConfiguration.tooltip.azureAgenticMaxOutputTokens'),
  };

  const resetSettingsToDefault = () => {
    const skmConfig = {
      range: '3',
      documents: '5',
      systemMessage: '',
      maxTokens: '1000',
      indexName: '',
      queryType: 'vector_semantic_hybrid',
      semanticConfiguration: 'azureml-default',
      inScope: 'true',
      useAgentic: 'false',
      azureAgentName: 'ai-act-agent',
      azureAgentType: 'agent_reference',
      azureClientId: '',
      azureClientSecret: '',
      azureAgenticMaxOutputTokens: '4000',
      domainUUID: [],
      azureClientSecretSet: 'false',
    };
    setSkmConfig(skmConfig);
    reset(skmConfig);
    setKey(key + 1);
  };

  const transferMutation = useMutation({
    mutationFn: (data: { sourceDomainUuid: string; targetDomainUuids: string[] }) =>
      apiDev.post('configs/transfer/skm-config', data),
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

  const handleTransfer = async (targetIds: string[]) => {
    try {
      await transferMutation.mutateAsync({ sourceDomainUuid: selectedDomains[0], targetDomainUuids: targetIds });
      await Promise.all(targetIds.map((id) => apiDev.post('configs/skm-config/secret', { domain: id, secret: '' })));
    } catch {
      // Failure toast already shown by transferMutation.onError
    }
  };

  const handleDomainSelection = useDomainSelectionHandler(setSelectedDomains, fetchData, resetSettingsToDefault);

  const sourceDomainSelected = multiDomainEnabled && selectedDomains.length === 1;

  if (!skmConfig) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>{t('settings.skmConfiguration.title')}</h1>
      <p>{t('settings.skmConfiguration.description')}</p>

      <Card
        isScrollable
        tabs={multiDomainEnabled && <DomainTabSelector onChange={handleDomainSelection} />}
        footer={
          <Track justify="end">
            <Button disabled={(multiDomainEnabled && selectedDomains.length === 0) || false} onClick={handleFormSubmit}>
              {t('global.save')}
            </Button>
          </Track>
        }
      >
        <Fragment key={key}>
          <Track gap={16} direction="vertical" align="left">
            <Track justify="between" align="center" style={{ width: '100%' }}>
              {getSwitchControl('useAgentic')}
              {sourceDomainSelected && (
                <DomainTransfer
                  allDomains={domainOptions}
                  excludedDomainIds={selectedDomains}
                  onTransfer={handleTransfer}
                  isTransferring={transferMutation.isPending}
                />
              )}
            </Track>
            {useAgentic !== 'true' && (
              <>
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
                        height={320}
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
                        onSelectionChange={(selection) => field.onChange(selection?.value)}
                        label={t('settings.skmConfiguration.queryType')}
                        defaultValue={field.value}
                        options={getQueryTypes()}
                      />
                      {getTooltip('queryType')}
                    </Track>
                  )}
                />
                {getSwitchControl('inScope')}
              </>
            )}
          </Track>
          {useAgentic === 'true' && (
            <Track gap={16} direction="vertical" align="left" style={{ paddingTop: 16 }}>
              {getTextControl('azureAgentName')}
              {getTextControl('azureAgentType')}
              {getTextControl('azureClientId')}
              {getNumberControl('azureAgenticMaxOutputTokens')}
              {getPasswordControl('azureClientSecret')}
            </Track>
          )}
        </Fragment>
      </Card>
    </>
  );

  function getTooltip(
    name:
      | 'range'
      | 'documents'
      | 'systemMessage'
      | 'maxTokens'
      | 'indexName'
      | 'queryType'
      | 'semanticConfiguration'
      | 'inScope'
      | 'useAgentic'
      | 'azureAgentName'
      | 'azureAgentType'
      | 'azureClientId'
      | 'azureClientSecret'
      | 'azureAgenticMaxOutputTokens',
  ) {
    return (
      <Tooltip content={tooltips[name]}>
        <span>
          <Icon icon={<AiOutlineInfoCircle fontSize={20} color="#005aa3" />} size="medium" />
        </span>
      </Tooltip>
    );
  }

  function getNumberControl(
    name: 'systemMessage' | 'range' | 'documents' | 'maxTokens' | 'azureAgenticMaxOutputTokens',
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
    name: 'indexName' | 'semanticConfiguration' | 'azureAgentName' | 'azureAgentType' | 'azureClientId',
  ) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Track gap={10} style={{ width: '100%' }}>
            <FormInput
              name={name}
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

  function getPasswordControl(name: 'azureClientSecret') {
    const disabled = multiDomainEnabled && selectedDomains.length > 1;
    const secretIsSet = skmConfig?.azureClientSecretSet === 'true';
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Track gap={10} style={{ width: '100%' }} isMultiline>
            <Track gap={10} style={{ width: '100%' }}>
              <Track direction="vertical" align="left" gap={4} style={{ width: '100%' }}>
                <FormInput
                  name={name}
                  label={t(`settings.skmConfiguration.${name}`)}
                  type="password"
                  autoComplete="new-password"
                  disabled={disabled}
                  placeholder={
                    secretIsSet ? t('settings.skmConfiguration.azureClientSecretSetPlaceholder').toString() : undefined
                  }
                  onChange={field.onChange}
                  value={field.value}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
              </Track>
              {getTooltip(name)}
            </Track>
            {secretIsSet && (
              <span style={{ fontSize: 12, color: '#5d6071' }}>
                {t('settings.skmConfiguration.azureClientSecretSetHint')}
              </span>
            )}
          </Track>
        )}
      />
    );
  }

  function getSwitchControl(name: 'inScope' | 'useAgentic') {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Track gap={10}>
            <Switch
              label={t(`settings.skmConfiguration.${name}`)}
              onCheckedChange={(value) => {
                field.onChange(value.toString());
              }}
              checked={field.value === 'true'}
              onLabel={t('global.yes').toString()}
              offLabel={t('global.no').toString()}
              {...field}
            />
            {getTooltip(name)}
          </Track>
        )}
      />
    );
  }
};

export default withAuthorization(SettingsSkmConfiguration, [ROLES.ROLE_ADMINISTRATOR]);
