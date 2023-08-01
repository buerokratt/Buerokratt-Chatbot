import { FC, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Layout } from 'components';
import useUserInfoStore from 'store/store';
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
import CsaActivityContext from 'providers/CsaActivityContext';

const App: FC = () => {
  const store = useUserInfoStore();
  const [chatCsaActive, setChatCsaActive] = useState<boolean>(false);
  const { data: userInfo } = useQuery<{
    data: { custom_jwt_userinfo: UserInfo };
  }>({
    queryKey: ['cs-custom-jwt-userinfo', 'prod'],
    onSuccess: (data: { data: { custom_jwt_userinfo: UserInfo } }) =>
      store.setUserInfo(data.data.custom_jwt_userinfo),
  });

  return (
    <CsaActivityContext.Provider value={{ chatCsaActive, setChatCsaActive }}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/vestlus/aktiivsed" />} />
          <Route path="/vestlus/vastamata" element={<ChatUnanswered />} />
          <Route path="/vestlus/aktiivsed" element={<ChatActive />} />
          <Route path="/vestlus/ajalugu" element={<ChatHistory />} />
          <Route path="/haldus/kasutajad" element={<SettingsUsers />} />
          <Route
            path="/haldus/vestlusrobot/seaded"
            element={<SettingsChatSettings />}
          />
          <Route
            path="/haldus/vestlusrobot/tervitussõnum"
            element={<SettingsWelcomeMessage />}
          />
          <Route
            path="/haldus/vestlusrobot/erakorralised-teated"
            element={<SettingsEmergencyNotices />}
          />
          <Route
            path="/haldus/vestlusrobot/välimus-ja-kaitumine"
            element={<SettingsAppearance />}
          />
          <Route
            path="/haldus/asutuse-tooaeg"
            element={<SettingsWorkingTime />}
          />
          <Route
            path="/haldus/sessiooni-pikkus"
            element={<SettingsSessionLength />}
          />
          <Route path="/seire/tooaeg" element={<MonitoringUptime />} />
        </Route>
      </Routes>
    </CsaActivityContext.Provider>
  );
};

export default App;
