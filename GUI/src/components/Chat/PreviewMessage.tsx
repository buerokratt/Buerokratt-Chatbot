import { FC } from 'react';
import clsx from 'clsx';
import Markdownify from './Markdownify';
import Track from 'components/Track';
import './Typing.scss';

type PreviewMessageProps = {
  preview: string | undefined;
};

const PreviewMessage: FC<PreviewMessageProps> = ({ preview }) => {
  return (
    <div className={clsx('active-chat__messageContainer')}>
      {!!preview && preview && (
        <div className={clsx('active-chat__message-preview')}>
          {!!preview && (
            <Track>
              <Markdownify message={preview ?? ''} />
              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </Track>
          )}
        </div>
      )}
    </div>
  );
};

export default PreviewMessage;
