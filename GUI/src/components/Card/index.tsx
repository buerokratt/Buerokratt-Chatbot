import clsx from 'clsx';
import { FC, PropsWithChildren, ReactNode } from 'react';

import './Card.scss';

type CardProps = {
  header?: ReactNode;
  tabs?: ReactNode;
  footer?: ReactNode;
  borderless?: boolean;
  isHeaderLight?: boolean;
  isBodyDivided?: boolean;
  isScrollable?: boolean;
};

const Card: FC<PropsWithChildren<CardProps>> = ({
  header,
  tabs,
  footer,
  borderless,
  isHeaderLight,
  isBodyDivided,
  isScrollable = false,
  children,
}) => {
  const cardContent = (
    <div className={clsx('card', { 'card--borderless': borderless, 'card--scrollable': isScrollable })}>
      {header && <div className={`card__header ${isHeaderLight ? 'white' : ''}`}>{header}</div>}
      <div className={`card__body ${isBodyDivided ? 'divided' : ''}`}>{children}</div>
      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );

  if (tabs) {
    return (
      <div className="card-tabs-wrapper">
        <div className="card__tabs">{tabs}</div>
        {cardContent}
      </div>
    );
  }

  return cardContent;
};

export default Card;
