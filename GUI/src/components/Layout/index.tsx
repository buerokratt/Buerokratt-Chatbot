import { FC, useState } from 'react';
import { Outlet } from 'react-router-dom';
import useStore from 'store';
import { MainNavigation } from '@buerokratt-ria/menu';
import { Header } from "@buerokratt-ria/header"
import './Layout.scss';
import {useToast} from "../../hooks/useToast";

const Layout: FC = () => {
  const [MainMenuItems, _] = useState([]);

  return (
    <div className="layout">
      <MainNavigation
        serviceId={import.meta.env.REACT_APP_SERVICE_ID.split(',')}
        items={MainMenuItems}
      />
      <div className="layout__wrapper">
        <Header
            toastContext={useToast()}
            user={useStore.getState().userInfo}
        />
        <main className="layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
