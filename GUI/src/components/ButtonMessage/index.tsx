import { FC } from 'react';
import { MessageButton } from 'types/message';
import './ButtonMessage.scss';

type ButtonMessageProps = {
  buttons: MessageButton[];
};

const ButtonMessage: FC<ButtonMessageProps> = ({ buttons }) => {
  return (
    <div className="button-container">
      {buttons.map(({ title }) => (
        <span key={title}>{title}</span>
      ))}
    </div>
  );
};

export default ButtonMessage;
