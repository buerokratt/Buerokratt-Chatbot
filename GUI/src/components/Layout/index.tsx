import { FC, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainNavigation, Header } from 'components';
import './Layout.scss';

const Layout: FC = () => {
  const CACHE_NAME = 'mainmenu-cache';

  const [MainMenuItems, setMainMenuItems] = useState([])

  const  {data, isLoading, status}  = useQuery({
    queryKey: [import.meta.env.REACT_APP_MENU_PATH,import.meta.env.REACT_APP_MENU_URL],
      onSuccess: (res: any) => {
        try {
          setMainMenuItems(res);
          localStorage.setItem(CACHE_NAME, JSON.stringify(res));
        } catch (e) {
          console.log(e);
        }
      },
      onError: (error: any) => {
        setMainMenuItems(getCache());
      }
      
    });

    function getCache(): any {
      const cache = localStorage.getItem(CACHE_NAME) || '{}';
      return JSON.parse(cache);
    }
 
  return (
    <div className='layout'>
      <MainNavigation items={MainMenuItems}/>
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
