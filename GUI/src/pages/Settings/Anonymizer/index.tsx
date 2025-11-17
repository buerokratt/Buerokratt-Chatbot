import { FC, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Card,
  Collapsible,
  FormCheckbox,
  FormSelect,
  FormTagInput,
  FormTextarea,
  IconSwitch,
  Track,
} from 'components';
import { useMutation } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import DomainSelector from '../../../components/DomainsSelector';
import { fetchConfigurationFromDomain } from '../../../services/configurations';
import { useDomainSelectionHandler } from '../../../hooks/useDomainSelectionHandler';
import {
  AnonymizerConfig,
  AnonymizerConfigResponse,
} from 'types/anonymizerConfig';

type SelectOption = { label: string; value: string; meta?: string };

const Anonymizer: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const multiDomainEnabled =
    import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [anonymizerConfig, setAnonymizerConfig] = useState<AnonymizerConfig>();
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [isAnonymizingText, setIsAnonymizingText] = useState<boolean>(false);

  const anonymizationApproaches: SelectOption[] = [
    {
      label: 'Replace',
      value: 'replace',
    },
    {
      label: 'Redact',
      value: 'redact',
    },
    {
      label: 'Mask',
      value: 'mask',
    },
    {
      label: 'Hash',
      value: 'hash',
    },
  ];

  useEffect(() => {
    if (multiDomainEnabled) {
      setLoadingComplete(true);
    } else {
      fetchData('none');
    }
  }, []);

  const fetchData = async (selectedDomain: string) => {
    try {
      const data: AnonymizerConfigResponse =
        await fetchConfigurationFromDomain<AnonymizerConfigResponse>(
          'configs/anonymizer',
          selectedDomain
        );

      const res = data.response;
      if (res) {
        setAnonymizerConfig(res);
      }
      setLoadingComplete(true);
    } catch (error) {
      console.error('Failed to fetch anonymizer data', error);
    }
  };

  const saveSettings = () => {
    setIsSavingSettings(true);
    if (anonymizerConfig) {
      setIsSavingSettings(true);
      anonymizerConfig.domainUUID = multiDomainEnabled ? selectedDomains : [];
      anonymizerSettingsMutation.mutate(anonymizerConfig);
    }
  };

  const anonymizeText = () => {
    setIsAnonymizingText(true);
    anonymizeTextMutation.mutate({
      text: inputText.trim(),
      domain: multiDomainEnabled
        ? selectedDomains.length === 1
          ? selectedDomains[0]
          : 'none'
        : 'none',
    });
  };

  const anonymizeTextMutation = useMutation({
    mutationFn: async (data: { text: string; domain?: string }) => {
      const response = await apiDev.post('anonymizer/anonymize', data);
      return response.data;
    },
    onSuccess: (result) => {
      setIsAnonymizingText(false);
      setOutputText(result.response);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('settings.anonymizer.textAnonymized'),
      });
    },
    onError: (error: AxiosError) => {
      setIsAnonymizingText(false);
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const anonymizerSettingsMutation = useMutation({
    mutationFn: (data: AnonymizerConfig) =>
      apiDev.post('configs/anonymizer', data),
    onSuccess: () => {
      setIsSavingSettings(false);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('settings.anonymizer.savedSettingsSuccessfully'),
      });
    },
    onError: (error: AxiosError) => {
      setIsSavingSettings(false);
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const resetSettingsToDefault = () => {
    setAnonymizerConfig({
      anonymizerSelectedApproach: '',
      entities:
        'GPE,CAR_NUMBER,DATE_TIME,EE_PERSONAL_CODE,PERSON,IBAN_CODE,ORGANIZATION,CREDIT_CARD,IP_ADDRESS,EST_ID_DOC,MEDICAL_LICENSE,URL,LOCATION,EMAIL_ADDRESS,CRYPTO,PHONE_NUMBER',
      anonymizerSelectedEntities: '',
      anonymizerAllowlist: '',
      anonymizerDenylist: '',
      isAnonymizationBeforeLlm: false,
      isAnonymizationBeforeGlobalClassifier: false,
    });
  };

  const handleDomainSelection = useDomainSelectionHandler(
    setSelectedDomains,
    fetchData,
    resetSettingsToDefault
  );

  if (!loadingComplete) {
    return <>Loading...</>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        gap: '24px',
      }}
    >
      <h1>{t('settings.anonymizer.settingsTitle')}</h1>
      {multiDomainEnabled && (
        <DomainSelector
          onChange={(selected) => {
            handleDomainSelection(selected);
          }}
        />
      )}

      <Card
        footer={
          <Track justify="end">
            <Button
              disabled={
                (multiDomainEnabled && selectedDomains.length === 0) || false
              }
              onClick={saveSettings}
              appearance={isSavingSettings ? 'loading' : 'primary'}
            >
              {t('settings.anonymizer.saveSettings')}
            </Button>
          </Track>
        }
      >
        <Track gap={16} direction="vertical" align="left">
          <p>{t('settings.anonymizer.approach')}</p>
          <FormSelect
            placeholder={t(
              'settings.anonymizer.approachOptionsPlaceholder'
            ).toString()}
            placeholderColor="#686B78"
            options={anonymizationApproaches}
            defaultValue={anonymizerConfig?.anonymizerSelectedApproach ?? ''}
            onSelectionChange={(selection) =>
              setAnonymizerConfig(
                (prev) =>
                  prev && {
                    ...prev,
                    anonymizerSelectedApproach: selection?.value ?? '',
                  }
              )
            }
          />
          <Collapsible
            title={t('settings.anonymizer.entities')}
            defaultOpen={true}
            appearance="normal"
            headerDivider={false}
            headerBackgroundColor={'transparent'}
            headerColor="#005AA3"
          >
            <p style={{ color: '#686B78', fontSize: '14px' }}>
              {t('settings.anonymizer.entitiesDescription')}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0px',
                columnGap: '56px',
                marginTop: '16px',
              }}
            >
              {anonymizerConfig?.entities.split(',').map((entity, index) => {
                const entityId = `${entity}`;
                return (
                  <Track direction="vertical" key={entityId}>
                    <FormCheckbox
                      name={entityId}
                      isInverted={true}
                      item={{
                        label: entity,
                        value: entity,
                      }}
                      checked={
                        anonymizerConfig?.anonymizerSelectedEntities
                          .split(',')
                          .includes(entityId) ?? false
                      }
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setAnonymizerConfig((prev) => {
                          if (!prev) return prev;
                          let updatedEntities = prev.anonymizerSelectedEntities
                            ? prev.anonymizerSelectedEntities.split(',')
                            : [];
                          if (isChecked) {
                            if (!updatedEntities.includes(entityId)) {
                              updatedEntities.push(entityId);
                            }
                          } else {
                            updatedEntities = updatedEntities.filter(
                              (id) => id !== entityId
                            );
                          }
                          return {
                            ...prev,
                            anonymizerSelectedEntities:
                              updatedEntities.join(','),
                          };
                        });
                      }}
                    />
                    <div
                      style={{
                        height: '1px',
                        backgroundColor: '#eceaeaff',
                        margin: '8px 0',
                        width: '100%',
                      }}
                    />
                  </Track>
                );
              })}
            </div>
          </Collapsible>
          <Collapsible
            title={t('settings.anonymizer.allowList')}
            defaultOpen={true}
            appearance="normal"
            headerDivider={false}
            headerBackgroundColor={'transparent'}
            headerColor="#005AA3"
          >
            <Track direction="vertical" gap={8} align="left">
              <FormTagInput
                tags={
                  anonymizerConfig?.anonymizerAllowlist
                    ? anonymizerConfig.anonymizerAllowlist.split(',')
                    : []
                }
                onChange={(tags) => {
                  setAnonymizerConfig((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      anonymizerAllowlist: tags.join(','),
                    };
                  });
                }}
                placeholder={t(
                  'settings.anonymizer.allowListPlaceholder'
                ).toString()}
              />
              <p style={{ color: '#686B78', fontSize: '14px' }}>
                {t('settings.anonymizer.allowListDescription')}
              </p>
            </Track>
          </Collapsible>
          <Collapsible
            title={t('settings.anonymizer.denyList')}
            defaultOpen={true}
            appearance="normal"
            headerDivider={false}
            headerBackgroundColor={'transparent'}
            headerColor="#005AA3"
          >
            <Track direction="vertical" gap={8} align="left">
              <FormTagInput
                tags={
                  anonymizerConfig?.anonymizerDenylist
                    ? anonymizerConfig.anonymizerDenylist.split(',')
                    : []
                }
                onChange={(tags) => {
                  setAnonymizerConfig((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      anonymizerDenylist: tags.join(','),
                    };
                  });
                }}
                placeholder={t(
                  'settings.anonymizer.denyListPlaceholder'
                ).toString()}
              />
              <p style={{ color: '#686B78', fontSize: '14px' }}>
                {t('settings.anonymizer.denyListDescription')}
              </p>
            </Track>
          </Collapsible>
          <Track gap={8} align="center">
            <IconSwitch
              checked={anonymizerConfig?.isAnonymizationBeforeLlm ?? false}
              onCheckedChange={(checked) =>
                setAnonymizerConfig(
                  (prev) =>
                    prev && { ...prev, isAnonymizationBeforeLlm: checked }
                )
              }
            />
            <label style={{ cursor: 'default' }}>
              {t('settings.anonymizer.anonymizationBeforeLLM')}
            </label>
          </Track>
          <Track gap={8} align="center">
            <IconSwitch
              checked={
                anonymizerConfig?.isAnonymizationBeforeGlobalClassifier ?? false
              }
              onCheckedChange={(checked) =>
                setAnonymizerConfig(
                  (prev) =>
                    prev && {
                      ...prev,
                      isAnonymizationBeforeGlobalClassifier: checked,
                    }
                )
              }
            />
            <label style={{ cursor: 'default' }}>
              {t('settings.anonymizer.anonymizationBeforeGlobalClassifier')}
            </label>
          </Track>
        </Track>
      </Card>
      <h1>{t('settings.anonymizer.testingTitle')}</h1>
      <Card>
        <Track gap={16} direction="vertical" align="left">
          <p style={{ color: '#686B78', fontSize: '16px' }}>
            {t('settings.anonymizer.testingDescription')}
          </p>
          <p>{t('settings.anonymizer.inputText')}</p>
          <FormTextarea
            placeholder={t(
              'settings.anonymizer.inputTextPlaceholder'
            ).toString()}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
            }}
            minRows={5}
            maxRows={5}
          />
          <Track justify="end" gap={8} style={{ width: '100%' }}>
            <Button
              onClick={() => {
                setInputText('');
              }}
              appearance="secondary"
              style={{
                color: inputText.trim() === '' ? undefined : '#005aa3',
                boxShadow:
                  inputText.trim() === '' ? undefined : '0 0 0 2px #005aa3',
              }}
              disabled={inputText.trim() === ''}
            >
              {t('settings.anonymizer.clear')}
            </Button>
            <Button
              onClick={anonymizeText}
              appearance={isAnonymizingText ? 'loading' : 'primary'}
            >
              {t('settings.anonymizer.anonymize')}
            </Button>
          </Track>
          <p>{t('settings.anonymizer.outputText')}</p>
          <FormTextarea
            placeholder={t(
              'settings.anonymizer.outputTextPlaceholder'
            ).toString()}
            value={outputText}
            minRows={5}
            maxRows={5}
            disabled
          />
        </Track>
      </Card>
    </div>
  );
};

export default withAuthorization(Anonymizer, [ROLES.ROLE_ADMINISTRATOR]);
