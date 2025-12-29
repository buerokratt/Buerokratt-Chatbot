import { Header, useMenuCountConf } from '@buerokratt-ria/header';
import { MainNavigation } from '@buerokratt-ria/menu';
import React, { FC } from 'react';
import { Outlet } from 'react-router-dom';
import useStore from 'store';

import { useToast } from '../../hooks/useToast';
import './Layout.scss';

const Layout: FC = () => {
  const menuCountConf = useMenuCountConf();
  return (
    <div className="layout">
      <MainNavigation countConf={menuCountConf} />
      <div className="layout__wrapper">
        <Header
          toastContext={useToast()}
          user={useStore.getState().userInfo}
          setUserDomains={useStore.getState().setUserDomains}
        />
        <main className="layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
