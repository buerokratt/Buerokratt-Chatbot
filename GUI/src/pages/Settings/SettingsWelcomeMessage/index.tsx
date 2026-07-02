import { WELCOME_MESSAGE_LENGTH } from 'constants/config';

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import clsx from 'clsx';
import { Button, Card, FormSelect, FormTextarea, Icon, Switch, Track } from 'components';
import { format } from 'date-fns';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineAccountTree, MdOutlineChatBubbleOutline } from 'react-icons/md';
import { apiDev } from 'services/api';
import { ROLES } from 'utils/constants';

import DomainTabSelector from '../../../components/DomainTabSelector';
import DomainTransfer from '../../../components/DomainTransfer';
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

          <div>
            <p className="greeting-type__title">{t('settings.welcomeMessage.greetingType')}</p>
            <p className="greeting-type__description">{t('settings.welcomeMessage.greetingTypeDescription')}</p>
            <Track gap={16} style={{ marginTop: 8 }}>
              <button
                type="button"
                className={clsx('greeting-type-option', { 'greeting-type-option--selected': greetingType === 'message' })}
                onClick={() => setGreetingType('message')}
              >
                <span className="greeting-type-option__icon">
                  <Icon icon={<MdOutlineChatBubbleOutline fontSize={20} color="rgba(0,0,0,0.54)" />} />
                </span>
                <span>
                  <span className="greeting-type-option__label">{t('settings.welcomeMessage.messageOption')}</span>
                  <span className="greeting-type-option__description">
                    {t('settings.welcomeMessage.messageOptionDescription')}
                  </span>
                </span>
              </button>
              <button
                type="button"
                className={clsx('greeting-type-option', { 'greeting-type-option--selected': greetingType === 'service' })}
                onClick={() => setGreetingType('service')}
              >
                <span className="greeting-type-option__icon">
                  <Icon icon={<MdOutlineAccountTree fontSize={20} color="rgba(0,0,0,0.54)" />} />
                </span>
                <span>
                  <span className="greeting-type-option__label">{t('settings.welcomeMessage.serviceOption')}</span>
                  <span className="greeting-type-option__description">
                    {t('settings.welcomeMessage.serviceOptionDescription')}
                  </span>
                </span>
              </button>
            </Track>
          </div>

          <FormTextarea
            key={key}
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
            <div>
              <p className="greeting-type__title">{t('settings.welcomeMessage.service')}</p>
              <p className="greeting-type__description">{t('settings.welcomeMessage.serviceDescription')}</p>
              <FormSelect
                name="serviceId"
                placeholder={t('settings.welcomeMessage.serviceDropdownPlaceholder') ?? ''}
                options={serviceOptions}
                defaultValue={serviceId}
                onSelectionChange={(selection) => setServiceId(selection?.value ?? '')}
              />
              {selectedService && (
                <div className="service-info-card">
                  <span className="service-info-card__icon">
                    <Icon icon={<MdOutlineAccountTree fontSize={20} color="rgba(0,0,0,0.54)" />} />
                  </span>
                  <div className="service-info-card__body">
                    <span className="service-info-card__name">{selectedService.name}</span>
                    <Track gap={16}>
                      <span
                        className={clsx('service-info-card__status', `service-info-card__status--${selectedService.state}`)}
                      >
                        {t(`settings.welcomeMessage.serviceState.${selectedService.state ?? 'draft'}`)}
                      </span>
                      {selectedService.updatedAt && (
                        <span className="service-info-card__updated">
                          {t('settings.welcomeMessage.lastUpdated')}:{' '}
                          {format(new Date(selectedService.updatedAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      )}
                    </Track>
                  </div>
                </div>
              )}
            </div>
          )}
        </Track>
      </Card>
    </>
  );
};

export default withAuthorization(SettingsWelcomeMessage, [ROLES.ROLE_ADMINISTRATOR]);
