import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  Button,
  Card,
  Collapsible,
  FormCheckbox,
  FormSelect,
  FormTagInput,
  FormTextarea,
  Icon,
  IconSwitch,
  Tooltip,
  Track,
} from 'components';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiDev } from 'services/api';
import { AnonymizerConfig, AnonymizerConfigResponse } from 'types/anonymizerConfig';
import { ROLES } from 'utils/constants';

import DomainTabSelector from '../../../components/DomainTabSelector';
import { useDomainSelectionHandler } from '../../../hooks/useDomainSelectionHandler';
import { fetchConfigurationFromDomain } from '../../../services/configurations';
import { AiOutlineInfoCircle } from 'react-icons/ai';

const ChatAnalysis: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [chatAnalysisConfig, setChatAnalysisConfig] = useState<AnonymizerConfig>();
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  useEffect(() => {
    resetSettingsToDefault();
    if (multiDomainEnabled) {
      setLoadingComplete(true);
    } else {
      fetchData('none');
    }
  }, []);

  const fetchData = async (selectedDomain: string) => {
    try {
      const data: AnonymizerConfigResponse = await fetchConfigurationFromDomain<AnonymizerConfigResponse>(
        'configs/chat-analysis',
        selectedDomain,
      );

      const res = data.response;
      if (res) {
        setChatAnalysisConfig(res);
      } else {
        resetSettingsToDefault();
      }
      setLoadingComplete(true);
    } catch (error) {
      console.error('Failed to fetch chat analysis data', error);
    }
  };

  const saveSettings = () => {
    if (chatAnalysisConfig) {
      setIsSavingSettings(true);
      chatAnalysisConfig.domainUUID = multiDomainEnabled ? selectedDomains : [];
      chatAnalysisSettingsMutation.mutate(chatAnalysisConfig);
    }
  };

  const chatAnalysisSettingsMutation = useMutation({
    mutationFn: (data: AnonymizerConfig) => apiDev.post('configs/chat-analysis', data),
    onSuccess: () => {
      setIsSavingSettings(false);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('settings.chatAnalysis.savedSettingsSuccessfully'),
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
    setChatAnalysisConfig({
      anonymizerSelectedApproach: '',
      entities:
        'GPE,CAR_NUMBER,DATE_TIME,EE_PERSONAL_CODE,PERSON,IBAN_CODE,ORGANIZATION,CREDIT_CARD,IP_ADDRESS,EST_ID_DOC,URL,LOCATION,EMAIL_ADDRESS,CRYPTO,PHONE_NUMBER',
      anonymizerSelectedEntities: '',
      anonymizerAllowlist: '',
      anonymizerDenylist: '',
      isAnonymizationBeforeLlm: false,
      isAnonymizationBeforeGlobalClassifier: false,
      recordConversationsAnonymously: false,
    });
  };

  const handleDomainSelection = useDomainSelectionHandler(setSelectedDomains, fetchData, resetSettingsToDefault);

  if (!loadingComplete) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>{t('settings.chatAnalysis.title')}</h1>
      <Card
        tabs={multiDomainEnabled && <DomainTabSelector onChange={handleDomainSelection} />}
        footer={
          <Track justify="end">
            <Button
              disabled={(multiDomainEnabled && selectedDomains.length === 0) || false}
              onClick={saveSettings}
              appearance={isSavingSettings ? 'loading' : 'primary'}
            >
              {t('global.save')}
            </Button>
          </Track>
        }
      >
        <Track gap={16} direction="vertical" align="left"></Track>
      </Card>
    </>
  );
};

export default withAuthorization(ChatAnalysis, [ROLES.ROLE_ADMINISTRATOR]);
