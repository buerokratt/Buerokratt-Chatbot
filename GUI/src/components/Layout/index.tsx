import React, { FC } from 'react';
import useStore from 'store';
import { Header } from '@buerokratt-ria/header';
import { Outlet } from 'react-router-dom';
import { MainNavigation } from '@buerokratt-ria/menu';
import { useToast } from '../../hooks/useToast';
import './Layout.scss';
import { useMenuCountConf } from '../../hooks/useMenuCountConf';

const Layout: FC = () => {
  const menuCountConf = useMenuCountConf();
  return (
    <div className="layout">
      <MainNavigation countConf={menuCountConf} />
      <div className="layout__wrapper">
        <Header toastContext={useToast()} user={useStore.getState().userInfo} />
        <main className="layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
