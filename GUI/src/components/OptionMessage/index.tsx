import { FC } from 'react';

type OptionMessageProps = {
  options: string[];
};

const OptionMessage: FC<OptionMessageProps> = ({ options }) => {
  return (
    <div>
      {options.map(option => 
        <span key={option}>{option}</span>
      )}
    </div>
  );
};

export default OptionMessage;
