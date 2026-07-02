import { WELCOME_MESSAGE_LENGTH } from 'constants/config';

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import clsx from 'clsx';
import { Button, Card, FormSelect, FormTextarea, Icon, Label, Switch, Track } from 'components';
import { format } from 'date-fns';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineChatBubbleOutline } from 'react-icons/md';
import { apiDev } from 'services/api';
import { ROLES } from 'utils/constants';

import DomainTabSelector from '../../../components/DomainTabSelector';
import DomainTransfer from '../../../components/DomainTransfer';
import ServiceFlowIcon from '../../../components/ServiceFlowIcon';
import { useDomainSelectionHandler } from '../../../hooks/useDomainSelectionHandler';
import { fetchConfigurationFromDomain } from '../../../services/configurations';
import useStore from '../../../store';
import { GreetingsMessage, GreetingsMessageResponse, GreetingType } from '../../../types/greetingMessage';
import { Service } from '../../../types/service';

import { SelectOption } from 'types';

import './SettingsWelcomeMessage.scss';

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
  const [greetingType, setGreetingType] = useState<GreetingType>('message');
  const [serviceId, setServiceId] = useState<string>('');
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    resetSettingsToDefault();
    if (multiDomainEnabled) {
      setLoadingComplete(true);
    } else {
      fetchData('none');
    }
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await apiDev.get<Service[] | { response: Service[] }>('service/active-services');
      const data = res.data;
      const rows = Array.isArray(data) ? data : data?.response;
      setServices(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error('Failed to fetch services', error);
      setServices([]);
    }
  };

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
        setGreetingType(res.type ?? 'message');
        setServiceId(res.serviceId ?? '');
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
    mutationFn: (data: { sourceDomainUuid: string; targetDomainUuids: string[] }) =>
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

  const selectedService = useMemo(
    () => services.find((service) => (service.serviceId ?? service.id) === serviceId),
    [services, serviceId],
  );

  const serviceOptions: { label: string; value: string }[] = services.map((service) => ({
    label: service.name,
    value: service.serviceId ?? service.id ?? '',
  }));

  const serviceStateLabelType: Record<NonNullable<Service['state']>, 'success' | 'info' | 'warning' | 'error'> = {
    active: 'success',
    ready: 'info',
    draft: 'warning',
    inactive: 'error',
  };

  const handleFormSubmit = () => {
    if (welcomeMessage.trim().length === 0) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.welcomeMessage.emptyMessage'),
      });
      return;
    }
    if (greetingType === 'service' && serviceId.trim().length === 0) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.welcomeMessage.emptyService'),
      });
      return;
    }

    const requestData: GreetingsMessage = {
      isActive: welcomeMessageActive ?? false,
      est: welcomeMessage,
      type: greetingType,
      serviceId,
      serviceName: selectedService?.name ?? '',
      domainUUID: multiDomainEnabled ? selectedDomains : [],
    };
    welcomeMessageMutation.mutate(requestData);
  };

  const handleTransfer = (targetIds: string[]) => {
    transferMutation.mutate({
      sourceDomainUuid: selectedDomains[0],
      targetDomainUuids: targetIds,
    });
  };

  const resetSettingsToDefault = () => {
    setWelcomeMessageActive(false);
    setWelcomeMessage('');
    setGreetingType('message');
    setServiceId('');
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
        isHeaderLight={multiDomainEnabled}
        isBodyDivided
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
        <Track align="center" className="welcome-message-section">
          <Track direction="vertical" align="left" className="welcome-message-section__label">
            <p className="greeting-type__title">{t('settings.welcomeMessage.greetingActive')}</p>
          </Track>
          <Track
            justify="between"
            align="center"
            className="welcome-message-section__control welcome-message-section__control--wide"
          >
            <Switch
              checked={welcomeMessageActive}
              hideLabel
              label={t('settings.welcomeMessage.greetingActive')}
              name="greetingActive"
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
        </Track>

        {welcomeMessageActive && (
          <>
            <Track align="center" className="welcome-message-section">
              <Track direction="vertical" align="left" gap={4} className="welcome-message-section__label">
                <p className="greeting-type__title">{t('settings.welcomeMessage.greetingType')}</p>
                <p className="greeting-type__description">{t('settings.welcomeMessage.greetingTypeDescription')}</p>
              </Track>
              <Track direction="vertical" align="left" className="welcome-message-section__control">
                <Track gap={16} className="greeting-type-options">
                  <button
                    type="button"
                    className={clsx('greeting-type-option', {
                      'greeting-type-option--selected': greetingType === 'message',
                    })}
                    onClick={() => setGreetingType('message')}
                  >
                    <span className="greeting-type-option__radio" aria-hidden="true" />
                    <span className="greeting-type-option__icon">
                      <Icon
                        icon={
                          <MdOutlineChatBubbleOutline
                            fontSize={20}
                            color={greetingType === 'message' ? '#003cff' : 'rgba(0,0,0,0.54)'}
                          />
                        }
                      />
                    </span>
                    <Track direction="vertical" align="left" gap={2}>
                      <span className="greeting-type-option__label">{t('settings.welcomeMessage.messageOption')}</span>
                      <span className="greeting-type-option__description">
                        {t('settings.welcomeMessage.messageOptionDescription')}
                      </span>
                    </Track>
                  </button>
                  <button
                    type="button"
                    className={clsx('greeting-type-option', {
                      'greeting-type-option--selected': greetingType === 'service',
                    })}
                    onClick={() => setGreetingType('service')}
                  >
                    <span className="greeting-type-option__radio" aria-hidden="true" />
                    <span className="greeting-type-option__icon">
                      <ServiceFlowIcon color={greetingType === 'service' ? '#003cff' : 'rgba(0,0,0,0.54)'} />
                    </span>
                    <Track direction="vertical" align="left" gap={2}>
                      <span className="greeting-type-option__label">{t('settings.welcomeMessage.serviceOption')}</span>
                      <span className="greeting-type-option__description">
                        {t('settings.welcomeMessage.serviceOptionDescription')}
                      </span>
                    </Track>
                  </button>
                </Track>
              </Track>
            </Track>

            <Track align="left" className="welcome-message-section">
              <Track direction="vertical" align="left" gap={4} className="welcome-message-section__label">
                <p className="greeting-type__title">
                  {greetingType === 'service'
                    ? t('settings.welcomeMessage.fallbackMessage')
                    : t('settings.welcomeMessage.welcomeMessage')}
                </p>
                {greetingType === 'service' && (
                  <p className="greeting-type__description">
                    {t('settings.welcomeMessage.fallbackMessageDescription')}
                  </p>
                )}
              </Track>
              <Track direction="vertical" align="left" className="welcome-message-section__control">
                <FormTextarea
                  key={key}
                  hideLabel
                  label={
                    greetingType === 'service'
                      ? t('settings.welcomeMessage.fallbackMessage')
                      : t('settings.welcomeMessage.welcomeMessage')
                  }
                  minRows={4}
                  maxLength={WELCOME_MESSAGE_LENGTH}
                  showMaxLength={true}
                  maxLengthBottom
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  defaultValue={welcomeMessage}
                  name="label"
                />
                {greetingType === 'service' && (
                  <p className="welcome-message-section__required-hint">
                    {t('settings.welcomeMessage.messageRequired')}
                  </p>
                )}
              </Track>
            </Track>

            {greetingType === 'service' && (
              <Track align="left" className="welcome-message-section">
                <Track direction="vertical" align="left" gap={4} className="welcome-message-section__label">
                  <p className="greeting-type__title">{t('settings.welcomeMessage.greetingService')}</p>
                  <p className="greeting-type__description">{t('settings.welcomeMessage.serviceDescription')}</p>
                </Track>
                <Track direction="vertical" align="left" className="welcome-message-section__control">
                  <FormSelect
                    hideLabel
                    name="serviceId"
                    placeholder={t('settings.welcomeMessage.serviceDropdownPlaceholder') ?? ''}
                    options={serviceOptions}
                    defaultValue={serviceId}
                    onSelectionChange={(selection) => setServiceId(selection?.value ?? '')}
                  />
                  {selectedService && (
                    <Track gap={12} align="center" className="service-info-card">
                      <span className="service-info-card__icon">
                        <ServiceFlowIcon />
                      </span>
                      <span className="service-info-card__name">{selectedService.name}</span>
                      <Track gap={16} align="center" className="service-info-card__meta">
                        <Track direction="vertical" align="left" gap={4} className="service-info-card__meta-item">
                          <span className="service-info-card__meta-label">{t('global.status')}</span>
                          <Label type={serviceStateLabelType[selectedService.state ?? 'draft']}>
                            {t(`settings.welcomeMessage.serviceState.${selectedService.state ?? 'draft'}`)}
                          </Label>
                        </Track>
                        {selectedService.updatedAt && (
                          <>
                            <span className="service-info-card__divider" aria-hidden="true" />
                            <Track direction="vertical" align="left" gap={4} className="service-info-card__meta-item">
                              <span className="service-info-card__meta-label">
                                {t('settings.welcomeMessage.lastUpdated')}
                              </span>
                              <span className="service-info-card__updated">
                                {format(new Date(selectedService.updatedAt), 'dd.MM.yyyy, HH:mm')}
                              </span>
                            </Track>
                          </>
                        )}
                      </Track>
                    </Track>
                  )}
                </Track>
              </Track>
            )}
          </>
        )}
      </Card>
    </>
  );
};

export default withAuthorization(SettingsWelcomeMessage, [ROLES.ROLE_ADMINISTRATOR]);
