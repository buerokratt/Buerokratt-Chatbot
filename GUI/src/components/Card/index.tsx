import { FC, PropsWithChildren, ReactNode } from 'react';

import './Card.scss';

type CardProps = {
  header?: ReactNode;
  footer?: ReactNode;
}

const Card: FC<PropsWithChildren<CardProps>> = ({ header, footer, children }) => {
  return (
    <div className='card'>
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
