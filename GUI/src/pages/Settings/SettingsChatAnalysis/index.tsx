import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Button, Card, Dialog, Switch, Track } from 'components';
import LabelSection from 'components/LabelSection';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { apiDev } from 'services/api';
import { ChatAnalysisConfig, ChatAnalysisConfigResponse } from 'types/chatAnalysisConfig';
import { ROLES } from 'utils/constants';

import DomainTabSelector from '../../../components/DomainTabSelector';
import DomainTransfer from '../../../components/DomainTransfer';
import { useDomainSelectionHandler } from '../../../hooks/useDomainSelectionHandler';
import { fetchConfigurationFromDomain } from '../../../services/configurations';
import useStore from '../../../store';

import { SelectOption } from 'types/selectOption';

type DeleteDialogState = {
  readonly field: 'theme' | 'quality' | 'followUp';
  readonly index: number;
  readonly label: string;
};

const ChatAnalysis: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const [selectedDomain, setSelectedDomain] = useState<string[]>([]);
  const rawDomains = useStore((state) => state.allDomains);
  const domainOptions: SelectOption[] = rawDomains.map((d) => ({ label: d.name, value: d.id }));
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  const [chatAnalysisEnabled, setChatAnalysisEnabled] = useState<boolean>(true);
  const [themeLabels, setThemeLabels] = useState<string[]>([]);
  const [qualityLabels, setQualityLabels] = useState<string[]>([]);
  const [followUpLabels, setFollowUpLabels] = useState<string[]>([]);

  const [themeInput, setThemeInput] = useState('');
  const [qualityInput, setQualityInput] = useState('');
  const [followUpInput, setFollowUpInput] = useState('');

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(null);

  useEffect(() => {
    resetSettingsToDefault();
    if (multiDomainEnabled) {
      setLoadingComplete(true);
    } else {
      fetchData('none');
    }
  }, []);

  const parseLabels = (value: string): string[] =>
    value
      ? value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const fetchData = async (selectedDomain: string) => {
    try {
      const data = await fetchConfigurationFromDomain<ChatAnalysisConfigResponse>(
        'configs/chat-analysis',
        selectedDomain,
      );
      const res = data.response;
      if (res) {
        setChatAnalysisEnabled(res.chatAnalysisEnabled);
        setThemeLabels(parseLabels(res.chatAnalysisTheme));
        setQualityLabels(parseLabels(res.chatAnalysisBykResponseQuality));
        setFollowUpLabels(parseLabels(res.chatAnalysisFollowUpAction));
      } else {
        resetSettingsToDefault();
      }
      setLoadingComplete(true);
    } catch (error) {
      console.error('Failed to fetch chat analysis data', error);
    }
  };

  const resetSettingsToDefault = () => {
    setChatAnalysisEnabled(true);
    setThemeLabels([]);
    setQualityLabels([]);
    setFollowUpLabels([]);
    setThemeInput('');
    setQualityInput('');
    setFollowUpInput('');
  };

  const addLabels = (
    input: string,
    labels: string[],
    setLabels: (labels: string[]) => void,
    setInput: (val: string) => void,
  ) => {
    if (!input.trim()) return;
    const newLabels = input
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    for (const label of newLabels) {
      if (label.length > 50) {
        toast.open({
          type: 'error',
          title: t('global.notificationError'),
          message: t('settings.chatAnalysis.labelTooLong'),
        });
        return;
      }
    }
    setLabels([...labels, ...newLabels]);
    setInput('');
  };

  const confirmDelete = () => {
    if (!deleteDialog) return;
    const { field, index } = deleteDialog;
    if (field === 'theme') setThemeLabels((prev) => prev.filter((_, i) => i !== index));
    if (field === 'quality') setQualityLabels((prev) => prev.filter((_, i) => i !== index));
    if (field === 'followUp') setFollowUpLabels((prev) => prev.filter((_, i) => i !== index));
    setDeleteDialog(null);
  };

  const saveSettings = () => {
    setIsSavingSettings(true);
    const config: ChatAnalysisConfig = {
      chatAnalysisEnabled,
      chatAnalysisTheme: themeLabels.join(','),
      chatAnalysisBykResponseQuality: qualityLabels.join(','),
      chatAnalysisFollowUpAction: followUpLabels.join(','),
      domainUuid: multiDomainEnabled ? selectedDomain : [],
    };
    chatAnalysisSettingsMutation.mutate(config);
  };

  const chatAnalysisSettingsMutation = useMutation({
    mutationFn: (data: ChatAnalysisConfig) => apiDev.post('configs/chat-analysis', data),
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

  const transferMutation = useMutation({
    mutationFn: (data: { sourceDomainUuid: string; targetDomainUuids: string[] }) =>
      apiDev.post('configs/transfer/chat-analysis', data),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('settings.chatAnalysis.savedSettingsSuccessfully'),
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

  const handleTransfer = (targetIds: string[]) => {
    transferMutation.mutate({ sourceDomainUuid: selectedDomain[0], targetDomainUuids: targetIds });
  };

  const handleDomainSelection = useDomainSelectionHandler(setSelectedDomain, fetchData, resetSettingsToDefault);

  const sourceDomainSelected = multiDomainEnabled && selectedDomain.length === 1;

  if (!loadingComplete) {
    return <>Loading...</>;
  }

  const dividerStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: '#E8EDF3',
    width: '100%',
    margin: '8px 0',
  };

  const dragHint = t('settings.chatAnalysis.dragHint');

  return (
    <>
      <h1>{t('settings.chatAnalysis.title')}</h1>
      <Card
        tabs={multiDomainEnabled && <DomainTabSelector onChange={handleDomainSelection} />}
        footer={
          <Track justify="end">
            <Button
              disabled={(multiDomainEnabled && selectedDomain.length === 0) || false}
              onClick={saveSettings}
              appearance={isSavingSettings ? 'loading' : 'primary'}
            >
              {t('global.save')}
            </Button>
          </Track>
        }
      >
        <Track gap={16} direction="vertical" align="left" style={{ width: '100%' }}>
          <Track justify="between" align="center" style={{ width: '100%' }}>
            <Switch
              name="chat_analysis_enabled"
              label={t('settings.chatAnalysis.chatAnalysisEnabled').toString()}
              checked={chatAnalysisEnabled}
              onCheckedChange={setChatAnalysisEnabled}
            />
            {sourceDomainSelected && (
              <DomainTransfer
                allDomains={domainOptions}
                excludedDomainIds={selectedDomain}
                onTransfer={handleTransfer}
                isTransferring={transferMutation.isPending}
              />
            )}
          </Track>

          {chatAnalysisEnabled && (
            <>
              <div style={dividerStyle} />
              <LabelSection
                title={t('settings.chatAnalysis.theme')}
                placeholder={t('settings.chatAnalysis.themePlaceholder')}
                hint={t('settings.chatAnalysis.themeHint')}
                tooltip={t('settings.chatAnalysis.themeTooltip')}
                dragHintLabel={dragHint}
                labels={themeLabels}
                inputValue={themeInput}
                onInputChange={setThemeInput}
                onAdd={() => addLabels(themeInput, themeLabels, setThemeLabels, setThemeInput)}
                onDeleteRequest={(index, label) => setDeleteDialog({ field: 'theme', index, label })}
                onReorder={setThemeLabels}
              />

              <div style={dividerStyle} />
              <LabelSection
                title={t('settings.chatAnalysis.responseQuality')}
                placeholder={t('settings.chatAnalysis.responseQualityPlaceholder')}
                hint={t('settings.chatAnalysis.responseQualityHint')}
                tooltip={t('settings.chatAnalysis.responseQualityTooltip')}
                dragHintLabel={dragHint}
                labels={qualityLabels}
                inputValue={qualityInput}
                onInputChange={setQualityInput}
                onAdd={() => addLabels(qualityInput, qualityLabels, setQualityLabels, setQualityInput)}
                onDeleteRequest={(index, label) => setDeleteDialog({ field: 'quality', index, label })}
                onReorder={setQualityLabels}
              />

              <div style={dividerStyle} />
              <LabelSection
                title={t('settings.chatAnalysis.followUpAction')}
                placeholder={t('settings.chatAnalysis.followUpActionPlaceholder')}
                hint={t('settings.chatAnalysis.followUpActionHint')}
                tooltip={t('settings.chatAnalysis.followUpActionTooltip')}
                dragHintLabel={dragHint}
                labels={followUpLabels}
                inputValue={followUpInput}
                onInputChange={setFollowUpInput}
                onAdd={() => addLabels(followUpInput, followUpLabels, setFollowUpLabels, setFollowUpInput)}
                onDeleteRequest={(index, label) => setDeleteDialog({ field: 'followUp', index, label })}
                onReorder={setFollowUpLabels}
              />
            </>
          )}
        </Track>
      </Card>

      {deleteDialog && (
        <Dialog
          title={t('settings.chatAnalysis.deleteDialogTitle')}
          onClose={() => setDeleteDialog(null)}
          footer={
            <>
              <Button appearance="secondary" onClick={() => setDeleteDialog(null)}>
                {t('settings.chatAnalysis.deleteCancel')}
              </Button>
              <Button appearance="primary" onClick={confirmDelete}>
                {t('settings.chatAnalysis.deleteConfirm')}
              </Button>
            </>
          }
        >
          <p style={{ lineHeight: 1.6 }}>
            <Trans
              i18nKey="settings.chatAnalysis.deleteDialogText"
              values={{ label: deleteDialog.label, confirm: t('settings.chatAnalysis.deleteConfirm') }}
              components={{ strong: <strong /> }}
            />
          </p>
        </Dialog>
      )}
    </>
  );
};

export default withAuthorization(ChatAnalysis, [ROLES.ROLE_ADMINISTRATOR]);
