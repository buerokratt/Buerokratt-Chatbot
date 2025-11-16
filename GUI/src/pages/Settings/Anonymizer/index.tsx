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
  Icon,
  Switch,
  SwitchBox,
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
  const [anonymizeBeforeLLM, setAnonymizeBeforeLLM] = useState<boolean>(false);
  const [anonymizeBeforeGlobalClassifier, setAnonymizeBeforeGlobalClassifier] =
    useState<boolean>(false);
  const multiDomainEnabled =
    import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);

  // TODO: Enhance to be used later when fetching data
  const anonymizationApproaches: SelectOption[] = [
    {
      label: 'replace',
      value: 'replace',
    },
    {
      label: 'mask',
      value: 'mask',
    },
    {
      label: 'redact',
      value: 'redact',
    },
    {
      label: 'encrypt',
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

  const handleFormSubmit = () => {
  };

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
         
            {/* <FormCheckbox
              label={t('chat.active.onlyActiveAgentsss')}
              name="active"
              item={{
                label: 'sasdaskldkdajdlaskdjakldjlsakdjlaskjd',
                value: 'active',
              }}
              onChange={(e) => {}}
              isInverted={true}
            /> */}
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
            minRows={5}
            maxRows={5}
          />
          <Track justify="end" gap={8} style={{ width: '100%' }}>
            <Button
              onClick={() => {}}
              appearance="secondary"
              style={{ color: '#005aa3', boxShadow: '0 0 0 2px #005aa3' }}
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
            disabled
            minRows={5}
            maxRows={5}
          />
        </Track>
      </Card>
    </div>
  );
};

export default withAuthorization(Anonymizer, [ROLES.ROLE_ADMINISTRATOR]);
