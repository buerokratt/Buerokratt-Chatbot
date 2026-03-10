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
        <Route index element={<Navigate to="/landing" />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/unanswered" element={<ChatUnanswered />} />
        <Route path="/active" element={<ChatActive />} />
        <Route path="/delete-conversations" element={<DeleteConversations />} />
        <Route path="/history" element={<ChatHistory />} />
        <Route path="/validations" element={<ValidationRequests />} />
        <Route path="/pending" element={<ChatPending />} />
        <Route path="/users" element={<SettingsUsers />} />
        <Route path="/chatbot/settings" element={<SettingsChatSettings />} />
        <Route path="/chatbot/welcome-message" element={<SettingsWelcomeMessage />} />
        <Route path="/chatbot/emergency-notices" element={<SettingsEmergencyNotices />} />
        <Route path="/chatbot/appearance" element={<SettingsAppearance />} />
        <Route path="/chatbot/feedback" element={<SettingsFeedback />} />
        <Route path="/working-time" element={<SettingsWorkingTime />} />
        <Route path="/session-length" element={<SettingsSessionLength />} />
        <Route path="/skm-configuration" element={<SettingsSkmConfiguration />} />
        <Route path="/skm-configuration" element={<SettingsSkmConfiguration />} />
        <Route path="/multi-domains" element={<MultiDomain />} />
        <Route path="/anonymizer" element={<Anonymizer />} />
        <Route path="/uptime" element={<MonitoringUptime />} />
      </Route>
    </Routes>
  );
};

export default App;
