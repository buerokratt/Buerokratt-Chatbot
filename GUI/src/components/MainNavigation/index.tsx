import { FC, MouseEvent, useEffect, useState } from 'react';

import { NavLink, useLocation } from 'react-router-dom';
import { MdClose, MdKeyboardArrowDown } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { MdOutlineForum, MdOutlineAdb, MdOutlineEqualizer, MdSettings, MdOutlineMonitorWeight } from 'react-icons/md';
import { Icon } from 'components';
import './MainNavigation.scss';

interface MenuItem {
  id?: string;
  label: TranslatedLabel;
  path: string | null;
  target?: '_blank' | '_self';
  children?: MenuItem[];
}

interface TranslatedLabel {
  [lang: string] : string;
}


const MainNavigation: FC<{items: MenuItem[]}> = ({items}) => {
  
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const menuIcons = [
    {
      id: 'conversations',
      icon: <MdOutlineForum />,
    },
    {
      id: 'training',
      icon: <MdOutlineAdb />,
    },
    {
      id: 'analytics',
      icon: <MdOutlineEqualizer />,
    },
    {
      id: 'settings',
      icon: <MdSettings />,
    },
    {
      id: 'monitoring',
      icon: <MdOutlineMonitorWeight />,
    },
  ];

  

      const { data } = useQuery({
        queryKey: ['cs-get-user-role', 'prod', items[0]?.id],
        onSuccess: (res: any) => {
          const filteredItems = items.filter((item) => {
            const role = res.data.get_user[0].authorities[0]
            switch (role) {
              case 'ROLE_ADMINISTRATOR': return item.id
              case 'ROLE_SERVICE_MANAGER': return item.id != 'settings' && item.id != 'training'
              case 'ROLE_CUSTOMER_SUPPORT_AGENT': return item.id != 'settings' && item.id != 'analytics'
              case 'ROLE_CHATBOT_TRAINER': return item.id != 'settings' && item.id != 'conversations'
              case 'ROLE_ANALYST': return item.id == 'analytics'
              case 'ROLE_UNAUTHENTICATED': return
              default: return
            }
          }) ?? []
          setMenuItems(filteredItems)
        }
    
      });




 
  const location = useLocation();
  const [navCollapsed, setNavCollapsed] = useState(false);

  const handleNavToggle = (event: MouseEvent) => {
    const isExpanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
    event.currentTarget.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
  };

  const renderMenuTree = (menuItems: MenuItem[]) => {
    return menuItems.map((menuItem) => (
      <li key={menuItem.label['et']}>
        {!!menuItem.children ? (
          <>
            <button
              className={clsx('nav__toggle', { 'nav__toggle--icon': !!menuItem.id })}
              aria-expanded={menuItem.path && location.pathname.includes(menuItem.path) ? 'true' : 'false'}
              onClick={handleNavToggle}
            >
              {menuItem.id && (
                <Icon icon={menuIcons.find(icon => icon.id === menuItem.id)?.icon} />
              )}
              <span>{menuItem.label['et']}</span>
              <Icon icon={<MdKeyboardArrowDown />} />
            </button>
            <ul
              className='nav__submenu'>
              {renderMenuTree(menuItem.children)}
            </ul>
          </>
        ) : (
          <NavLink to={menuItem.path || '#'}>{menuItem.label['et']}</NavLink>
        )}
      </li>),
    );
  };

  if (!menuItems) return null;

  return (
    <nav className={clsx('nav', { 'nav--collapsed': navCollapsed })}>
      <button className='nav__menu-toggle' onClick={() => setNavCollapsed(!navCollapsed)}>
        <Icon icon={<MdClose />} />
        {t('mainMenu.closeMenu')}
      </button>
      <ul className='nav__menu'>
        {renderMenuTree(menuItems)}
      </ul>
    </nav>
  );
};

export default MainNavigation;
