import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Layout } from 'components';
import useStore from 'store';
import { UserInfo } from 'types/userInfo';

import ChatActive from 'pages/Chat/ChatActive';
import ChatHistory from 'pages/Chat/ChatHistory';

import SettingsUsers from 'pages/Settings/SettingsUsers';
import SettingsChatSettings from 'pages/Settings/SettingsChatSettings';
import SettingsEmergencyNotices from 'pages/Settings/SettingsEmergencyNotices';
import SettingsAppearance from 'pages/Settings/SettingsAppearance';
import SettingsWorkingTime from 'pages/Settings/SettingsWorkingTime';

import ChatUnanswered from 'pages/Chat/ChatUnanswered';
import MonitoringUptime from 'pages/Monitoring/MonitoringUptime';
import SettingsWelcomeMessage from 'pages/Settings/SettingsWelcomeMessage';
import SettingsSessionLength from 'pages/Settings/SettingsSessionLength';
import './locale/et_EE';
import ChatPending from 'pages/Chat/ChatPending';
import DeleteConversations from './pages/Settings/DeleteConversations';
import ValidationRequests from './pages/Chat/ValidationRequests';
import SettingsSkmConfiguration from 'pages/Settings/SettingsSkmConfiguration';
import SettingsFeedback from 'pages/Settings/SettingsFeedback';

const App: FC = () => {
  useQuery<{
    data: { custom_jwt_userinfo: UserInfo };
  }>({
    queryKey: ['auth/jwt/userinfo', 'prod'],
    onSuccess: (res: { response: UserInfo }) => {
      localStorage.setItem('exp', res.response.JWTExpirationTimestamp);
      return useStore.getState().setUserInfo(res.response);
    },
  });

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/active" />} />
        <Route path="/unanswered" element={<ChatUnanswered />} />
        <Route path="/active" element={<ChatActive />} />
        <Route path="/delete-conversations" element={<DeleteConversations />} />
        <Route path="/history" element={<ChatHistory />} />
        <Route path="/validations" element={<ValidationRequests />} />
        <Route path="/pending" element={<ChatPending />} />
        <Route path="/users" element={<SettingsUsers />} />
        <Route path="/chatbot/settings" element={<SettingsChatSettings />} />
        <Route
          path="/chatbot/welcome-message"
          element={<SettingsWelcomeMessage />}
        />
        <Route
          path="/chatbot/emergency-notices"
          element={<SettingsEmergencyNotices />}
        />
        <Route path="/chatbot/appearance" element={<SettingsAppearance />} />
        <Route path="/chatbot/feedback" element={<SettingsFeedback />} />
        <Route path="/working-time" element={<SettingsWorkingTime />} />
        <Route path="/session-length" element={<SettingsSessionLength />} />
        <Route path="/skm-configuration" element={<SettingsSkmConfiguration />} />
        <Route path="/uptime" element={<MonitoringUptime />} />
      </Route>
    </Routes>
  );
};

export default App;
