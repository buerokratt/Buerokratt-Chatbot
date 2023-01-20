import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineExpandMore } from 'react-icons/md';

import { Track, Button, Icon, Drawer } from 'components';
import useUserInfoStore from 'store/store';
import { ReactComponent as BykLogo } from 'assets/logo.svg';
import './Header.scss';

const Header: FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfoStore();
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);

  console.log(userInfo);

  return (
    <>
      <header className='header'>
        <Track justify='between'>
          <BykLogo height={50} />

          {userInfo && (
            <Track gap={32}>
              <Button appearance='text' onClick={() => setUserDrawerOpen(!userDrawerOpen)}>
                {userInfo.displayName}
                <Icon icon={<MdOutlineExpandMore />} />
              </Button>
              <Button appearance='text' style={{ textDecoration: 'underline' }}>{t('global.logout')}</Button>
            </Track>
          )}
        </Track>
      </header>

      {userInfo && userDrawerOpen && (
        <Drawer title={userInfo.displayName} onClose={() => setUserDrawerOpen(false)}>

        </Drawer>
      )}
    </>
  );
};

export default Header;
