import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Button, Card, Dialog, FormTextarea, Icon, Switch, Tooltip, Track } from 'components';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiDev } from 'services/api';
import { BotConfigResponse } from 'types/botConfig';
import { ROLES } from 'utils/constants';

import DomainSelector from '../../../components/DomainsSelector';
import { useDomainSelectionHandler } from '../../../hooks/useDomainSelectionHandler';
import { fetchConfigurationFromDomain } from '../../../services/configurations';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { SUB_TITLE_LENGTH } from 'constants/config';

const SettingsChatSettings: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const hasRendered = useRef<boolean>();
  const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isBotActive, setIsBotActive] = useState<boolean | undefined>(undefined);
  const [currentIsBurokrattActive, setCurrentIsBurokrattActive] = useState<boolean | undefined>(undefined);
  const [isBurokrattActive, setIsBurokrattActive] = useState<boolean | undefined>(undefined);
  const [isNameVisible, setIsNameVisible] = useState<boolean | undefined>(undefined);
  const [isTitleVisible, setIsTitleVisible] = useState<boolean | undefined>(undefined);
  const [isEditChatVisible, setIsEditChatVisible] = useState<boolean | undefined>(undefined);
  const [instantlyOpenChatWidget, setInstantlyOpenChatWidget] = useState<boolean | undefined>(undefined);
  const [showSubTitle, setShowSubTitle] = useState<boolean | undefined>(undefined);
  const [subTitle, setSubTitle] = useState<string>('');
  const queryClient = useQueryClient();
  const [burokrattConfirmationModal, setBurokrattConfirmationModal] = useState<boolean | null>(null);
  const tooltips = {
    is_bot_active: t('settings.chat.tooltip.isBotActive'),
    is_burokratt_active: t('settings.chat.tooltip.isBurokrattActive'),
    instantly_open_chat_widget: t('settings.chat.tooltip.instantlyOpenChatWidget'),
    is_csa_name_visible: t('settings.chat.tooltip.isCsaNameVisible'),
    is_csa_title_visible: t('settings.chat.tooltip.isCsaTitleVisible'),
    is_edit_chat_visible: t('settings.chat.tooltip.isEditChatVisible'),
    show_sub_title: t('settings.chat.tooltip.showSubTitle'),
    sub_title: t('settings.chat.tooltip.subTitle'),
  };

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
      const data: BotConfigResponse = await fetchConfigurationFromDomain<BotConfigResponse>(
        'configs/bot-config',
        selectedDomain,
      );

      const res = data.response;

      setIsBotActive(res.isBotActive === 'true');
      setIsBurokrattActive(res.isBurokrattActive === 'true');
      setCurrentIsBurokrattActive(res.isBurokrattActive === 'true');
      setIsNameVisible(res.isCsaNameVisible === 'true');
      setIsTitleVisible(res.isCsaTitleVisible === 'true');
      setIsEditChatVisible(res.isEditChatVisible === 'true');
      setInstantlyOpenChatWidget(res.instantlyOpenChatWidget === 'true');
      setShowSubTitle(res.showSubTitle === 'true');
      setSubTitle(res.subTitle);

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
      instantly_open_chat_widget: boolean;
      show_sub_title: boolean;
      sub_title: string;
      domainUUID: string[];
    }) => {
      return apiDev.post(`configs/bot-config`, {
        isBotActive: data.is_bot_active.toString(),
        isBurokrattActive: data.is_burokratt_active.toString(),
        isCsaNameVisible: data.is_csa_name_visible.toString(),
        isCsaTitleVisible: data.is_csa_title_visible.toString(),
        isEditChatVisible: data.is_edit_chat_visible.toString(),
        instantlyOpenChatWidget: data.instantly_open_chat_widget.toString(),
        showSubTitle: data.show_sub_title.toString(),
        subTitle: data.sub_title,
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
      instantly_open_chat_widget: instantlyOpenChatWidget ?? false,
      show_sub_title: showSubTitle ?? false,
      sub_title: subTitle ?? '',
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
    setInstantlyOpenChatWidget(false);
    setShowSubTitle(false);
    setSubTitle('');
  };

  const handleDomainSelection = useDomainSelectionHandler(setSelectedDomains, fetchData, resetSettingsToDefault);

  function getTooltip(
    name:
      | 'is_bot_active'
      | 'is_burokratt_active'
      | 'instantly_open_chat_widget'
      | 'is_csa_name_visible'
      | 'is_csa_title_visible'
      | 'is_edit_chat_visible'
      | 'show_sub_title'
      | 'sub_title',
  ) {
    return (
      <Tooltip content={tooltips[name]}>
        <span>
          <Icon icon={<AiOutlineInfoCircle fontSize={20} color="#005aa3" />} size="medium" />
        </span>
      </Tooltip>
    );
  }

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
          <Track direction="vertical" gap={8} align="left">
            {isBotActive != undefined && (
              <Track gap={10}>
                <Switch
                  name="is_bot_active"
                  label={t('settings.chat.chatActive').toString()}
                  checked={isBotActive}
                  onCheckedChange={setIsBotActive}
                />
                {getTooltip('is_bot_active')}
              </Track>
            )}
            {isBurokrattActive != undefined && (
              <Track gap={10}>
                <Switch
                  name="is_burokratt_active"
                  label={t('settings.chat.burokrattActive').toString()}
                  checked={isBurokrattActive}
                  onCheckedChange={setIsBurokrattActive}
                />
                {getTooltip('is_burokratt_active')}
              </Track>
            )}
            {instantlyOpenChatWidget != undefined && (
              <Track gap={10}>
                <Switch
                  name="instantly_open_chat_widget"
                  label={t('settings.chat.instantlyOpenChatWidget').toString()}
                  checked={instantlyOpenChatWidget}
                  onCheckedChange={setInstantlyOpenChatWidget}
                />
                {getTooltip('instantly_open_chat_widget')}
              </Track>
            )}
            {showSubTitle != undefined && (
              <Track gap={10}>
                <Switch
                  name="show_sub_title"
                  label={t('settings.chat.showSubTitle').toString()}
                  checked={showSubTitle}
                  onCheckedChange={setShowSubTitle}
                />
                {getTooltip('show_sub_title')}
              </Track>
            )}
            {subTitle != undefined && showSubTitle !== undefined && showSubTitle === true && (
              <Track gap={10}>
                <FormTextarea
                  label={t('settings.chat.subTitle').toString()}
                  minRows={4}
                  maxLength={SUB_TITLE_LENGTH}
                  showMaxLength={true}
                  maxLengthBottom
                  onChange={(e) => setSubTitle(e.target.value)}
                  defaultValue={subTitle}
                  name="sub_title"
                />
                {getTooltip('sub_title')}
              </Track>
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
            <Track gap={10}>
              <Switch
                name="is_csa_name_visible"
                label={t('settings.chat.showSupportName').toString()}
                checked={isNameVisible}
                onCheckedChange={setIsNameVisible}
              />
              {getTooltip('is_csa_name_visible')}
            </Track>
          )}
          {isTitleVisible != undefined && (
            <Track gap={10}>
              <Switch
                name="is_csa_title_visible"
                label={t('settings.chat.showSupportTitle').toString()}
                checked={isTitleVisible}
                onCheckedChange={setIsTitleVisible}
              />
              {getTooltip('is_csa_title_visible')}
            </Track>
          )}
          {isEditChatVisible != undefined && (
            <Track gap={10}>
              <Switch
                name="is_edit_chat_visible"
                label={t('settings.chat.editActiveChat').toString()}
                checked={isEditChatVisible}
                onCheckedChange={setIsEditChatVisible}
              />
              {getTooltip('is_edit_chat_visible')}
            </Track>
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
                    instantly_open_chat_widget: instantlyOpenChatWidget ?? false,
                    show_sub_title: showSubTitle ?? false,
                    sub_title: subTitle ?? '',
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

export default withAuthorization(SettingsChatSettings, [ROLES.ROLE_ADMINISTRATOR]);
