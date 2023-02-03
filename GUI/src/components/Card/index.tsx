import { FC, PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';

import './Card.scss';

type CardProps = {
  header?: ReactNode;
  footer?: ReactNode;
  borderless?: boolean;
}

const Card: FC<PropsWithChildren<CardProps>> = ({ header, footer, borderless, children }) => {
  return (
    <div className={clsx('card', { 'card--borderless': borderless })}>
      {header && <div className='card__header'>{header}</div>}
      <div className='card__body'>
        {children}
      </div>
      {footer && (
        <div className='card__footer'>{footer}</div>
      )}
    </div>
  );
};

export default Card;
