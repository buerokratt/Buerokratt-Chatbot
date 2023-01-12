import { FC } from 'react';
import { Outlet } from 'react-router-dom';

import { MainNavigation, Header } from 'components';
import './Layout.scss';

const Layout: FC = () => {
  return (
    <div className='layout'>
      <MainNavigation />
      <div className='layout__wrapper'>
        <Header />
        <main className='layout__main'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
