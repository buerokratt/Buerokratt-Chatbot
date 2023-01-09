import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from 'components';
import ChatActive from './pages/ Chat/ChatActive';

const App: FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to='/vestlus/aktiivsed' />} />
        <Route path='/vestlus/aktiivsed' element={<ChatActive />} />
      </Route>
    </Routes>
  );
};

export default App;
