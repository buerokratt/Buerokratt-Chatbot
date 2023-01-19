import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from 'components';
import ChatActive from 'pages/Chat/ChatActive';
import ChatHistory from 'pages/Chat/ChatHistory';
import SettingsUsers from 'pages/Settings/SettingsUsers';
import SettingsChatSettings from 'pages/Settings/SettingsChatSettings';
import SettingsEmergencyNotices from 'pages/Settings/SettingsEmergencyNotices';
import SettingsAppearance from 'pages/Settings/SettingsAppearance';
import SettingsWorkingTime from 'pages/Settings/SettingsWorkingTime';

const App: FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to='/vestlus/aktiivsed' />} />
        <Route path='/vestlus/aktiivsed' element={<ChatActive />} />
        <Route path='/vestlus/ajalugu' element={<ChatHistory />} />
        <Route path='/haldus/kasutajad' element={<SettingsUsers />} />
        <Route path='/haldus/vestlusrobot/seaded' element={<SettingsChatSettings />} />
        <Route path='/haldus/vestlusrobot/erakorralised-teated' element={<SettingsEmergencyNotices />} />
        <Route path='/haldus/vestlusrobot/välimus-ja-kaitumine' element={<SettingsAppearance />} />
        <Route path='/haldus/asutuse-tooaeg' element={<SettingsWorkingTime />} />
      </Route>
    </Routes>
  );
};

export default App;
