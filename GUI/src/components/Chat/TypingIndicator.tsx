import Track from 'components/Track';
import { FC } from 'react';

import './Typing.scss';

const TypingIndicator: FC = () => (
  <div className="active-chat__messageContainer">
    <Track>
      <div className="active-chat__typing">
        <div className="typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </Track>
  </div>
);

export default TypingIndicator;
