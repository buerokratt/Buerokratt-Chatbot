import { userStore as useHeaderStore } from '@buerokratt-ria/header';
import { useQuery } from '@tanstack/react-query';
import { Layout } from 'components';
import LandingPage from 'pages';
import ChatActive from 'pages/Chat/ChatActive';
import ChatHistory from 'pages/Chat/ChatHistory';
import ChatPending from 'pages/Chat/ChatPending';
import ChatUnanswered from 'pages/Chat/ChatUnanswered';
import MonitoringUptime from 'pages/Monitoring/MonitoringUptime';
import Anonymizer from 'pages/Settings/Anonymizer';
import SettingsAppearance from 'pages/Settings/SettingsAppearance';
import SettingsChatSettings from 'pages/Settings/SettingsChatSettings';
import SettingsEmergencyNotices from 'pages/Settings/SettingsEmergencyNotices';
import SettingsSessionLength from 'pages/Settings/SettingsSessionLength';
import SettingsUsers from 'pages/Settings/SettingsUsers';
import SettingsWelcomeMessage from 'pages/Settings/SettingsWelcomeMessage';
import SettingsWorkingTime from 'pages/Settings/SettingsWorkingTime';
import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import useStore from 'store';
import { UserInfo } from 'types/userInfo';
import './locale/et_EE';

import useTabCloseEffect from './hooks/useTabCloseEffects';
import ValidationRequests from './pages/Chat/ValidationRequests';
import DeleteConversations from './pages/Settings/DeleteConversations';

import SettingsSkmConfiguration from 'pages/Settings/SettingsSkmConfiguration';

import MultiDomain from './pages/Settings/MultiDomain';

import SettingsFeedback from 'pages/Settings/SettingsFeedback';

import { getWidgetData } from './services/users';
import { ROUTES } from './constants/routes';

const App: FC = () => {
  const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';

  useQuery<{
    data: { custom_jwt_userinfo: UserInfo };
  }>({
    queryKey: ['auth/jwt/userinfo', 'prod'],
    onSuccess: (res: { response: UserInfo }) => {
      localStorage.setItem('exp', res.response.JWTExpirationTimestamp);

      if (multiDomainEnabled) {
        getWidgetData(res.response.idCode)
          .then((domains) => {
            const selectedDomains = domains
              .filter((d) => d.selected)
              .map((d) => d.url)
              .filter(Boolean);

            useStore.getState().setUserDomains(selectedDomains);
            useHeaderStore.getState().setUserDomains(selectedDomains);
          })
          .catch((e) => {
            console.error('Failed to fetch widget data:', e);
          });
      }

      return useStore.getState().setUserInfo(res.response);
    },
  });

  useTabCloseEffect();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to={ROUTES.LANDING} />} />
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
        <Route path={ROUTES.UNANSWERED} element={<ChatUnanswered />} />
        <Route path={ROUTES.ACTIVE} element={<ChatActive />} />
        <Route path={ROUTES.DELETE_CONVERSATIONS} element={<DeleteConversations />} />
        <Route path={ROUTES.HISTORY} element={<ChatHistory />} />
        <Route path={ROUTES.VALIDATIONS} element={<ValidationRequests />} />
        <Route path={ROUTES.PENDING} element={<ChatPending />} />
        <Route path={ROUTES.USERS} element={<SettingsUsers />} />
        <Route path={ROUTES.CHATBOT_SETTINGS} element={<SettingsChatSettings />} />
        <Route path={ROUTES.CHATBOT_WELCOME_MESSAGE} element={<SettingsWelcomeMessage />} />
        <Route path={ROUTES.CHATBOT_EMERGENCY_NOTICES} element={<SettingsEmergencyNotices />} />
        <Route path={ROUTES.CHATBOT_APPEARANCE} element={<SettingsAppearance />} />
        <Route path={ROUTES.CHATBOT_FEEDBACK} element={<SettingsFeedback />} />
        <Route path={ROUTES.WORKING_TIME} element={<SettingsWorkingTime />} />
        <Route path={ROUTES.SESSION_LENGTH} element={<SettingsSessionLength />} />
        <Route path={ROUTES.SKM_CONFIGURATION} element={<SettingsSkmConfiguration />} />
        <Route path={ROUTES.MULTI_DOMAINS} element={<MultiDomain />} />
        <Route path={ROUTES.ANONYMIZER} element={<Anonymizer />} />
        <Route path={ROUTES.UPTIME} element={<MonitoringUptime />} />
      </Route>
    </Routes>
  );
};

export default App;
