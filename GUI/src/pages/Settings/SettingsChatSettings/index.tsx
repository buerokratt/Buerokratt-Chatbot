import { FC, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';

import { Button, Card, Dialog, Switch, Track } from 'components';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { BotConfig } from 'types/botConfig';

const SettingsChatSettings: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
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

  const { data: config } = useQuery<{ config: BotConfig }>({
    queryKey: ['configs/bot-config', 'prod'],
    onSuccess(data: any) {
      const res = data.response;
      setIsBotActive(res.isBotActive === 'true');
      setIsBurokrattActive(res.isBurokrattActive === 'true');
      setCurrentIsBurokrattActive(res.isBurokrattActive === 'true');
      setIsNameVisible(res.isCsaNameVisible === 'true');
      setIsTitleVisible(res.isCsaTitleVisible === 'true');
      setIsEditChatVisible(res.isEditChatVisible === 'true');
    },
  });

  const botConfigMutation = useMutation({
    mutationFn: (data: {
      is_bot_active: boolean;
      is_burokratt_active: boolean;
      is_csa_name_visible: boolean;
      is_csa_title_visible: boolean;
      is_edit_chat_visible: boolean;
    }) => {
      return apiDev.post(`configs/bot-config`, {
        isBotActive: data.is_bot_active.toString(),
        isBurokrattActive: data.is_burokratt_active.toString(),
        isCsaNameVisible: data.is_csa_name_visible.toString(),
        isCsaTitleVisible: data.is_csa_title_visible.toString(),
        isEditChatVisible: data.is_edit_chat_visible.toString(),
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
    });
  };

  if (!config) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>{t('settings.title')}</h1>

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
