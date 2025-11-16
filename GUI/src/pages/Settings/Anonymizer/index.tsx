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

type SelectOption = { label: string; value: string; meta?: string };

const Anonymizer: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [allowList, setAllowList] = useState<string[]>([]);
  const [denyList, setDenyList] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [anonymizeBeforeLLM, setAnonymizeBeforeLLM] = useState<boolean>(false);
  const [anonymizeBeforeGlobalClassifier, setAnonymizeBeforeGlobalClassifier] =
    useState<boolean>(true);
  const multiDomainEnabled =
    import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [entities, setEntities] = useState<string[]>([
    'Person',
    'Location',
    'Phone number',
    'Email address',
    'Organization',
    'Other',
    'Other',
    'Other',
    'Other',
    'Other',
    'Other',
  ]);
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);
  const [selectedEntities, setSelectedEntities] = useState<{
    [key: string]: boolean;
  }>({});

  const anonymizationApproaches: SelectOption[] = [
    {
      label: 'Replace',
      value: 'replace',
    },
    {
      label: 'Mask',
      value: 'mask',
    },
    {
      label: 'Redact',
      value: 'redact',
    },
    {
      label: 'Encrypt',
      value: 'encrypt',
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
      // Todo: fetch data
      setLoadingComplete(true);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handleFormSubmit = () => {};

  const resetSettingsToDefault = () => {};

  const handleDomainSelection = useDomainSelectionHandler(
    setSelectedDomains,
    fetchData,
    resetSettingsToDefault
  );

  // if (!loadingComplete) {
  //   return <>Loading...</>;
  // }

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
              onClick={handleFormSubmit}
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
              {entities.map((entity, index) => {
                const entityId = `entity-${index}-${entity}`;
                return (
                  <Track direction='vertical' key={entityId}>
                    <FormCheckbox
                      name={entityId}
                      isInverted={true}
                      item={{
                        label: entity,
                        value: entity,
                      }}
                      checked={selectedEntities[entityId] || false}
                      onChange={(e) => {
                        setSelectedEntities((prev) => ({
                          ...prev,
                          [entityId]: e.target.checked,
                        }));
                      }}
                    />
                    <div style={{ height: '1px', backgroundColor: '#eceaeaff', margin: '8px 0', width: '100%' }} />
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
                tags={allowList}
                onChange={setAllowList}
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
                tags={denyList}
                onChange={setDenyList}
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
              checked={anonymizeBeforeLLM}
              onCheckedChange={setAnonymizeBeforeLLM}
            />
            <label>{t('settings.anonymizer.anonymizationBeforeLLM')}</label>
          </Track>
          <Track gap={8} align="center">
            <IconSwitch
              checked={anonymizeBeforeGlobalClassifier}
              onCheckedChange={setAnonymizeBeforeGlobalClassifier}
            />
            <label>
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
            <Button onClick={() => {}}>
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
