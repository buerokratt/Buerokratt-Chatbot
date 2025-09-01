import { FC, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';

import { Button, Card, Dialog, Switch, Track } from 'components';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { BotConfigResponse } from 'types/botConfig';
import DomainSelector from '../../../components/DomainsSelector';
import { useDomainSelectionHandler } from '../../../hooks/useDomainSelectionHandler';
import { fetchConfigurationFromDomain } from '../../../services/configurations';

const SettingsChatSettings: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const hasRendered = useRef<boolean>();
  const multiDomainEnabled =
    import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isBotActive, setIsBotActive] = useState<boolean | undefined>(
    undefined
  );
  const [currentIsBurokrattActive, setCurrentIsBurokrattActive] = useState<
    boolean | undefined
  >(undefined);
  const [isBurokrattActive, setIsBurokrattActive] = useState<
    boolean | undefined
  >(undefined);
  const [isNameVisible, setIsNameVisible] = useState<boolean | undefined>(
    undefined
  );
  const [isTitleVisible, setIsTitleVisible] = useState<boolean | undefined>(
    undefined
  );
  const [isEditChatVisible, setIsEditChatVisible] = useState<
    boolean | undefined
  >(undefined);
  const queryClient = useQueryClient();
  const [burokrattConfirmationModal, setBurokrattConfirmationModal] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    if (multiDomainEnabled) {
      hasRendered.current = true;
      resetSettingsToDefault();
    } else {
      fetchData('none');
    }
  }, []);

  const fetchData = async (selectedDomain: string) => {
    try {
      const data: BotConfigResponse =
        await fetchConfigurationFromDomain<BotConfigResponse>(
          'configs/bot-config',
          selectedDomain
        );

      const res = data.response;

      setIsBotActive(res.isBotActive === 'true');
      setIsBurokrattActive(res.isBurokrattActive === 'true');
      setCurrentIsBurokrattActive(res.isBurokrattActive === 'true');
      setIsNameVisible(res.isCsaNameVisible === 'true');
      setIsTitleVisible(res.isCsaTitleVisible === 'true');
      setIsEditChatVisible(res.isEditChatVisible === 'true');

      hasRendered.current = true;
    } catch (error) {
      console.error('Failed to fetch appearance', error);
    }
  };

  const botConfigMutation = useMutation({
    mutationFn: (data: {
      is_bot_active: boolean;
      is_burokratt_active: boolean;
      is_csa_name_visible: boolean;
      is_csa_title_visible: boolean;
      is_edit_chat_visible: boolean;
      domainUUID: string[];
    }) => {
      return apiDev.post(`configs/bot-config`, {
        isBotActive: data.is_bot_active.toString(),
        isBurokrattActive: data.is_burokratt_active.toString(),
        isCsaNameVisible: data.is_csa_name_visible.toString(),
        isCsaTitleVisible: data.is_csa_title_visible.toString(),
        isEditChatVisible: data.is_edit_chat_visible.toString(),
        domainUUID: data.domainUUID,
      });
    },
    onSuccess: async () => {
      setBurokrattConfirmationModal(null);
      await queryClient.invalidateQueries(['configs/bot-config', 'prod']);
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

  const handleFormSubmit = () => {
    if (isBurokrattActive !== currentIsBurokrattActive) {
      setBurokrattConfirmationModal(true);
      return;
    }

    botConfigMutation.mutate({
      is_bot_active: isBotActive ?? true,
      is_burokratt_active: isBurokrattActive ?? true,
      is_csa_name_visible: isNameVisible ?? true,
      is_csa_title_visible: isTitleVisible ?? true,
      is_edit_chat_visible: isEditChatVisible ?? true,
      domainUUID: multiDomainEnabled ? selectedDomains : [],
    });
  };

  const resetSettingsToDefault = () => {
    setIsBotActive(false);
    setIsBurokrattActive(false);
    setCurrentIsBurokrattActive(false);
    setIsNameVisible(false);
    setIsTitleVisible(false);
    setIsEditChatVisible(false);
  };

  const handleDomainSelection = useDomainSelectionHandler(
    setSelectedDomains,
    fetchData,
    resetSettingsToDefault
  );

  if (!hasRendered) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>{t('settings.title')}</h1>

      {multiDomainEnabled && (
        <div style={{ marginBottom: '11px' }}>
          <DomainSelector
            onChange={(selected) => {
              handleDomainSelection(selected);
            }}
          />
        </div>
      )}

      <Card
        header={
          <Track direction="vertical" gap={8}>
            {isBotActive != undefined && (
              <Switch
                name="is_bot_active"
                label={t('settings.chat.chatActive')}
                checked={isBotActive}
                onCheckedChange={setIsBotActive}
              />
            )}
            {isBurokrattActive != undefined && (
              <Switch
                name="is_burokratt_active"
                label={t('settings.chat.burokrattActive')}
                checked={isBurokrattActive}
                onCheckedChange={setIsBurokrattActive}
              />
            )}
          </Track>
        }
        footer={
          <Track justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={8} direction="vertical" align="left">
          {isNameVisible != undefined && (
            <Switch
              name="is_csa_name_visible"
              label={t('settings.chat.showSupportName')}
              checked={isNameVisible}
              onCheckedChange={setIsNameVisible}
            />
          )}
          {isTitleVisible != undefined && (
            <Switch
              name="is_csa_title_visible"
              label={t('settings.chat.showSupportTitle')}
              checked={isTitleVisible}
              onCheckedChange={setIsTitleVisible}
            />
          )}
          {isEditChatVisible != undefined && (
            <Switch
              name="is_edit_chat_visible"
              label={t('settings.chat.editActiveChat')}
              checked={isEditChatVisible}
              onCheckedChange={setIsEditChatVisible}
            />
          )}
        </Track>
      </Card>
      {burokrattConfirmationModal && (
        <Dialog
          title={t('global.removeValidation')}
          onClose={() => setBurokrattConfirmationModal(null)}
          footer={
            <>
              <Button
                appearance="secondary"
                onClick={() => {
                  setBurokrattConfirmationModal(null);
                }}
              >
                {t('global.cancel')}
              </Button>
              <Button
                onClick={() => {
                  setCurrentIsBurokrattActive(isBurokrattActive);
                  botConfigMutation.mutate({
                    is_bot_active: isBotActive ?? true,
                    is_burokratt_active: isBurokrattActive ?? true,
                    is_csa_name_visible: isNameVisible ?? true,
                    is_csa_title_visible: isTitleVisible ?? true,
                    is_edit_chat_visible: isEditChatVisible ?? true,
                    domainUUID: multiDomainEnabled ? selectedDomains : [],
                  });
                }}
              >
                {t('global.yes')}
              </Button>
            </>
          }
        >
          {
            <p>
              {isBurokrattActive
                ? t('settings.chat.showBurokrattConfirmation')
                : t('settings.chat.hideBurokrattConfirmation')}
            </p>
          }
        </Dialog>
      )}
    </>
  );
};

export default withAuthorization(SettingsChatSettings, [
  ROLES.ROLE_ADMINISTRATOR,
]);
