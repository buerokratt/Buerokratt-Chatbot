import { FC } from 'react';
import clsx from 'clsx';
import Markdownify from './Markdownify';
import Track from 'components/Track';
import './Typing.scss';
import { format } from 'date-fns';

type PreviewMessageProps = {
  preview: string | undefined;
};

const PreviewMessage: FC<PreviewMessageProps> = ({ preview }) => {
  return (
    <div className={clsx('active-chat__messageContainer')}>
      <Track gap={10}>
        {!!preview && preview && (
          <div className={clsx('active-chat__message-preview')}>
            {!!preview && (
              <Track>
                {/* Commented out as per request in task -1024- */}
                {/* <Markdownify message={preview ?? ''} /> */}
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </Track>
            )}
          </div>
        )}
        <label
          className="active-chat__message-date"
        >
          {'00:00:00'}
        </label>
      </Track>
    </div>
  );
};

export default PreviewMessage;
