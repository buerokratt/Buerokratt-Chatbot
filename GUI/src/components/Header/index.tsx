import { FC } from 'react';

import { ReactComponent as BykLogo } from 'assets/logo.svg';
import './Header.scss';

const Header: FC = () => {
  return (
    <header className='header'>
      <BykLogo height={50} />
    </header>
  );
};

export default Header;
