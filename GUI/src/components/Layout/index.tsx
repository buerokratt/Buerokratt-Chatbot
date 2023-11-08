import { FC, useState } from 'react';
import { Outlet } from 'react-router-dom';
import  Header from '../Header';
import {
    MainNavigation
} from '@exirain/header/src';
import './Layout.scss';
import {useQuery} from "@tanstack/react-query";
import imts from './menu-structure.json';

const Layout: FC = () => {   const CACHE_NAME = 'mainmenu-cache';


    const [MainMenuItems, setMainMenuItems] = useState(imts)

    const  {data, isLoading, status}  = useQuery({
        queryKey: [import.meta.env.REACT_APP_MENU_URL + import.meta.env.REACT_APP_MENU_PATH],
        onSuccess: (res: any) => {
            try {
                setMainMenuItems(res);
                localStorage.setItem(CACHE_NAME, JSON.stringify(itms));
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
        <div className="layout">
            <MainNavigation serviceId={import.meta.env.REACT_APP_SERVICE_ID.split(',')} items={MainMenuItems}/>
            <div className="layout__wrapper">
                <Header />
                <main className="layout__main">
                    <Outlet />
                </main>
            </div>
        </div>
    )};

export default Layout;