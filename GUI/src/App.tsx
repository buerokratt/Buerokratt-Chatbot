import { FC, useState } from 'react';
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

const App: FC = () => {
  useQuery<{
    data: { custom_jwt_userinfo: UserInfo };
  }>({
    queryKey: ['cs-custom-jwt-userinfo', 'prod'],
    onSuccess: (data: { data: { custom_jwt_userinfo: UserInfo } }) => {
      localStorage.setItem(
        'exp',
        data.data.custom_jwt_userinfo.JWTExpirationTimestamp
      );
      return useStore.getState().setUserInfo(data.data.custom_jwt_userinfo);
    },
  });

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/chat/active" />} />
        <Route path="/chat/unanswered" element={<ChatUnanswered />} />
        <Route path="/chat/active" element={<ChatActive />} />
        <Route path="/chat/history" element={<ChatHistory />} />
        <Route path="/settings/users" element={<SettingsUsers />} />
        <Route
          path="/settings/chatbot/settings"
          element={<SettingsChatSettings />}
        />
        <Route
          path="/settings/chatbot/welcome-message"
          element={<SettingsWelcomeMessage />}
        />
        <Route
          path="/settings/chatbot/emergency-notices"
          element={<SettingsEmergencyNotices />}
        />
        <Route
          path="/settings/chatbot/appearance"
          element={<SettingsAppearance />}
        />
        <Route
          path="/settings/working-time"
          element={<SettingsWorkingTime />}
        />
        <Route
          path="/settings/session-length"
          element={<SettingsSessionLength />}
        />
        <Route path="/monitoring/uptime" element={<MonitoringUptime />} />
      </Route>
    </Routes>
  );
};

export default App;
