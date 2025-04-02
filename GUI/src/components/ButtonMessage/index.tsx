import { FC } from 'react';
import { MessageButton } from 'types/message';
import './ButtonMessage.scss';

type ButtonMessageProps = {
  buttons: MessageButton[];
};

const ButtonMessage: FC<ButtonMessageProps> = ({ buttons }) => {
  return (
    <div className='button-container'>
      {buttons.map(({title, payload}) => 
        <span key={title}>{title}({payload})</span>
      )}
    </div>
  );
};

export default ButtonMessage;
