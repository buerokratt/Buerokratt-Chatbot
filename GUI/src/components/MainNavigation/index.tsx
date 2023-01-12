import { FC, MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { MdClose, MdKeyboardArrowDown } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { Icon } from 'components';
import type { MainNavigation as MainNavigationType, MenuItem } from 'types/mainNavigation';
import { menuIcons } from 'constants/menuIcons';
import './MainNavigation.scss';

const MainNavigation: FC = () => {
  const { t } = useTranslation();
  const { data: menuItems } = useQuery<MainNavigationType>(['main-navigation']);
  const location = useLocation();
  const [navCollapsed, setNavCollapsed] = useState(false);

  const handleNavToggle = (event: MouseEvent) => {
    const isExpanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
    event.currentTarget.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
  };

  const renderMenuTree = (menuItems: MenuItem[]) => {
    return menuItems.map((menuItem) => (
      <li key={menuItem.label}>
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
              <span>{menuItem.label}</span>
              <Icon icon={<MdKeyboardArrowDown />} />
            </button>
            <ul
              className='nav__submenu'>
              {renderMenuTree(menuItem.children)}
            </ul>
          </>
        ) : (
          <NavLink to={menuItem.path || '#'}>{menuItem.label}</NavLink>
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
        {renderMenuTree(menuItems.data)}
      </ul>
    </nav>
  );
};

export default MainNavigation;
