import { FC, useState } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { Button, Card, FormInput, Track } from 'components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import './SettingsSessionLength.scss';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';

const SettingsSessionLength: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [sessionLength, setSessionLength] = useState<string>('');
  useQuery({
    queryKey: ['accounts/admin/session-length', 'prod'],
    onSuccess: (res: any) => setSessionLength(res.response ?? ''),
  });

  const sessionLengthMutation = useMutation({
    mutationFn: () =>
      apiDev.post('accounts/admin/session-length', {
        sessionLength: sessionLength,
      }),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('settings.userSession.sessionChanged'),
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
    if (sessionLength.length === 0) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.userSession.emptySession'),
      });
    } else if (parseInt(sessionLength) < 30 || parseInt(sessionLength) > 480) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: t('settings.userSession.invalidSession'),
      });
    } else {
      sessionLengthMutation.mutate();
    }
  };

  return (
    <>
      <h1>{t('settings.userSession.sessionLength')}</h1>
      <p>{t('settings.userSession.description')}</p>
      <Card
        footer={
          <Track justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
          </Track>
        }
      >
        <Track gap={16} direction="vertical" align="left">
          <Track>
            <FormInput
              name="session-length"
              label={t('settings.userSession.sessionLength')}
              type="number"
              onChange={(e) => setSessionLength(e.target.value)}
              value={sessionLength}
            />
            <label className="minute">
              {t('settings.userSession.minutes')}
            </label>
          </Track>
          <label className="rule">{t('settings.userSession.rule')}</label>
        </Track>
      </Card>
    </>
  );
};

export default withAuthorization(SettingsSessionLength, [ROLES.ROLE_ADMINISTRATOR]);
