import { Header, useMenuCountConf } from '@buerokratt-ria/header';
import { MainNavigation } from '@buerokratt-ria/menu';
import React, { FC } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import useStore from 'store';

import { PAGES_WITH_DOMAIN_TAB_SELECTOR } from '../../constants/routes';
import { useToast } from '../../hooks/useToast';
import './Layout.scss';

const Layout: FC = () => {
  const menuCountConf = useMenuCountConf();
  const { pathname } = useLocation();
  const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
  const hasDomainTabSelector = multiDomainEnabled && PAGES_WITH_DOMAIN_TAB_SELECTOR.includes(pathname);
  const domainBarShowing = multiDomainEnabled && !hasDomainTabSelector;

  return (
    <div
      className={`layout${domainBarShowing ? ' layout--multi-domain' : ''}${hasDomainTabSelector ? ' layout--hide-domain-bar' : ''}`}
    >
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
