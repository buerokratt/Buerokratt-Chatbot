import { FC } from 'react';
import { MessageButton } from 'types/message';

type ButtonMessageProps = {
  buttons: MessageButton[];
};

const ButtonMessage: FC<ButtonMessageProps> = ({ buttons }) => {
  return (
    <div>
      {buttons.map(({title, payload}) => 
        <span key={title}>{title}({payload})</span>
      )}
    </div>
  );
};

export default ButtonMessage;
