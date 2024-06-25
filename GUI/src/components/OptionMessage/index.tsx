import { FC } from 'react';
import './OptionMessage.scss';

type OptionMessageProps = {
  options: string[];
};

const OptionMessage: FC<OptionMessageProps> = ({ options }) => {
  return (
    <div className='option-container'>
      {options.map(option => <span key={option}>{option}</span>)}
    </div>
  );
};

export default OptionMessage;
