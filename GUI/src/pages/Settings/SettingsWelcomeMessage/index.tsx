import { WELCOME_MESSAGE_LENGTH } from 'constants/config';

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Button, Card, FormTextarea, Switch, Track } from 'components';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiDev } from 'services/api';
import { ROLES } from 'utils/constants';

import DomainTabSelector from '../../../components/DomainTabSelector';
import DomainTransfer from '../../../components/DomainTransfer';
import { useDomainSelectionHandler } from '../../../hooks/useDomainSelectionHandler';
import { fetchConfigurationFromDomain } from '../../../services/configurations';
import useStore from '../../../store';
import { GreetingsMessage, GreetingsMessageResponse } from '../../../types/greetingMessage';

type SelectOption = { label: string; value: string };

const SettingsWelcomeMessage: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);
  const rawDomains = useStore((state) => state.allDomains);
  const allDomains: SelectOption[] = rawDomains.map((d) => ({ label: d.name, value: d.id }));

  const [welcomeMessageActive, setWelcomeMessageActive] = useState<boolean | undefined>(undefined);

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
      const data: GreetingsMessageResponse = await fetchConfigurationFromDomain<GreetingsMessageResponse>(
        'greeting/message',
        selectedDomain,
      );

      const res = data.response;

      if (res) {
        setWelcomeMessageActive(res.isActive);
        setWelcomeMessage(res.est);
        setKey(key + 1);
      } else {
        resetSettingsToDefault();
      }
      setLoadingComplete(true);
    } catch (error) {
      console.error('Failed to fetch greeting message', error);
    }
  };

  const welcomeMessageMutation = useMutation({
    mutationFn: (data: GreetingsMessage) => apiDev.post('greeting/greetings-message', data),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('settings.welcomeMessage.messageChanged'),
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

  const transferMutation = useMutation({
    mutationFn: (data: { sourceDomainUUID: string; targetDomainUUIDs: string[] }) =>
      apiDev.post('configs/transfer/greeting', data),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('settings.welcomeMessage.messageChanged'),
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

  const handleFormSubmit = () => {
    if (welcomeMessage.length === 0) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.welcomeMessage.emptyMessage'),
      });
    } else {
      const requestData: GreetingsMessage = {
        isActive: welcomeMessageActive ?? false,
        est: welcomeMessage,
        domainUUID: multiDomainEnabled ? selectedDomains : [],
      };
      welcomeMessageMutation.mutate(requestData);
    }
  };

  const handleTransfer = (targetIds: string[]) => {
    transferMutation.mutate({
      sourceDomainUUID: selectedDomains[0],
      targetDomainUUIDs: targetIds,
    });
  };

  const resetSettingsToDefault = () => {
    setWelcomeMessageActive(false);
    setWelcomeMessage('');
  };

  const handleDomainSelection = useDomainSelectionHandler(setSelectedDomains, fetchData, resetSettingsToDefault);

  if (!loadingComplete) {
    return <>Loading...</>;
  }

  const sourceDomainSelected = multiDomainEnabled && selectedDomains.length === 1;

  return (
    <>
      <h1>{t('settings.welcomeMessage.welcomeMessage')}</h1>
      <p>{t('settings.welcomeMessage.description')}</p>

      <Card
        tabs={multiDomainEnabled && <DomainTabSelector onChange={handleDomainSelection} />}
        footer={
          <Track justify="end">
            <Button disabled={(multiDomainEnabled && selectedDomains.length === 0) || false} onClick={handleFormSubmit}>
              {t('global.save')}
            </Button>
          </Track>
        }
      >
        <Track gap={16} direction="vertical" align="left">
          <Track justify="between" align="center" style={{ width: '100%' }}>
            <Switch
              checked={welcomeMessageActive}
              label={t('settings.welcomeMessage.greetingActive')}
              name={'label'}
              onCheckedChange={setWelcomeMessageActive}
            />
            {sourceDomainSelected && (
              <DomainTransfer
                allDomains={allDomains}
                excludedDomainIds={selectedDomains}
                onTransfer={handleTransfer}
                isTransferring={transferMutation.isPending}
              />
            )}
          </Track>
          <FormTextarea
            key={key}
            label={t('settings.welcomeMessage.welcomeMessage')}
            minRows={4}
            maxLength={WELCOME_MESSAGE_LENGTH}
            showMaxLength={true}
            maxLengthBottom
            onChange={(e) => setWelcomeMessage(e.target.value)}
            defaultValue={welcomeMessage}
            name="label"
          />
        </Track>
      </Card>
    </>
  );
};

export default withAuthorization(SettingsWelcomeMessage, [ROLES.ROLE_ADMINISTRATOR]);
