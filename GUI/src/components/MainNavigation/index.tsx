import { FC, MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { MdClose, MdKeyboardArrowDown } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Icon } from 'components';
import type { MenuItem } from 'types/mainNavigation';
import { menuIcons } from 'constants/menuIcons';
import './MainNavigation.scss';

const MainNavigation: FC = () => {
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const items = [
    {
      id: 'conversations',
      label: t('menu.conversations'),
      path: '/chat',
      children: [
        {
          label: t('menu.unanswered'),
          path: '/chat/unanswered',
        },
        {
          label: t('menu.active'),
          path: '/chat/active',
        },
        {
          label: t('menu.history'),
          path: '/chat/history',
        },
      ],
    },
    {
      id: 'training',
      label: t('menu.training'),
      path: '#',
      children: [
        {
          label: t('menu.training'),
          path: '#',
          children: [
            {
              label: t('menu.themes'),
              path: '#',
            },
            {
              label: t('menu.answers'),
              path: '#',
            },
            {
              label: t('menu.userStories'),
              path: '#',
            },
            {
              label: t('menu.configuration'),
              path: '#',
            },
            {
              label: t('menu.forms'),
              path: '#',
            },
            {
              label: t('menu.slots'),
              path: '#',
            },
          ],
        },
        {
          label: t('menu.historicalConversations'),
          path: '#',
          children: [
            {
              label: t('menu.history'),
              path: '#',
            },
            {
              label: t('menu.appeals'),
              path: '#',
            },
          ],
        },
        {
          label: t('menu.modelBankAndAnalytics'),
          path: '#',
          children: [
            {
              label: t('menu.overviewOfTopics'),
              path: '#',
            },
            {
              label: t('menu.comparisonOfModels'),
              path: '#',
            },
            {
              label: t('menu.testTracks'),
              path: '#',
            },
          ],
        },
        {
          label: t('menu.trainNewModel'),
          path: '#',
        },
      ],
    },
    {
      id: 'analytics',
      label: t('menu.analytics'),
      path: '/analytics',
      children: [
        {
          label: t('menu.overview'),
          path: '#',
        },
        {
          label: t('menu.chats'),
          path: '#',
        },
        {
          label: t('menu.burokratt'),
          path: '#',
        },
        {
          label: t('menu.feedback'),
          path: '#',
        },
        {
          label: t('menu.advisors'),
          path: '#',
        },
        {
          label: t('menu.reports'),
          path: '#',
        },
      ],
    },
    {
      id: 'settings',
      label: t('menu.administration'),
      path: '/settings',
      children: [
        {
          label: t('menu.users'),
          path: '/settings/users',
        },
        {
          label: t('menu.chatbot'),
          path: '/settings/chatbot',
          children: [
            {
              label: t('menu.settings'),
              path: '/settings/chatbot/settings',
            },
            {
              label: t('menu.welcomeMessage'),
              path: '/settings/chatbot/welcome-message',
            },
            {
              label: t('menu.appearanceAndBehavior'),
              path: '/settings/chatbot/appearance',
            },
            {
              label: t('menu.emergencyNotices'),
              path: '/settings/chatbot/emergency-notices',
            },
          ],
        },
        {
          label: t('menu.officeOpeningHours'),
          path: '/settings/working-time',
        },
        {
          label: t('menu.sessionLength'),
          path: '/settings/session-length',
        },
      ],
    },
    {
      id: 'monitoring',
      label: t('menu.monitoring'),
      path: '/monitoring',
      children: [
        {
          label: t('menu.workingHours'),
          path: '/monitoring/uptime',
        },
      ],
    },
  ];

  const { data } = useQuery({
    queryKey: ['cs-get-user-role', 'prod'],
    onSuccess: (res: any) => {
      const filteredItems = items.filter((item) => {
        const role = res.data.get_user[0].authorities[0]
        switch (role) {
          case 'ROLE_ADMINISTRATOR': return item.id
          case 'ROLE_SERVICE_MANAGER': return item.id != 'settings' && item.id != 'training'
          case 'ROLE_CUSTOMER_SUPPORT_AGENT': return item.id != 'settings' && item.id != 'analytics'
          case 'ROLE_CHATBOT_TRAINER': return item.id != 'settings' && item.id != 'conversations'
          case 'ROLE_ANALYST': return item.id == 'analytics' || item.id == 'monitoring'
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
        {renderMenuTree(menuItems)}
      </ul>
    </nav>
  );
};

export default MainNavigation;
