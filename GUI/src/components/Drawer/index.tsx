import { CSSProperties, FC, PropsWithChildren, useEffect, useRef } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import autoAnimate from '@formkit/auto-animate';

import { Icon } from 'components';
import './Drawer.scss';

type DrawerProps = {
  title: string;
  onClose: () => void;
  style?: CSSProperties;
}

const Drawer: FC<PropsWithChildren<DrawerProps>> = ({ title, onClose, children, style }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current && autoAnimate(ref.current);
    const handleKeyup = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keyup', handleKeyup);

    return () => document.removeEventListener('keyup', handleKeyup);
  }, [onClose]);

  return (
    <div className='drawer' style={style}>
      <div className='drawer__header'>
        <h2 className='h3 drawer__title'>{title}</h2>
        <button className='drawer__close' onClick={onClose}>
          <Icon icon={<MdOutlineClose />} size='medium' />
        </button>
      </div>
      <div className='drawer__body'>
        {children}
      </div>
    </div>
  );
};

export default Drawer;
