import { FC, PropsWithChildren, ReactNode } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';

import './Popover.scss';

type PopoverProps = {
  content: ReactNode;
  defaultOpen?: boolean;
}

const Popover: FC<PropsWithChildren<PopoverProps>> = ({ children, content, defaultOpen = false }) => {
  return (
    <RadixPopover.Root defaultOpen={defaultOpen}>
      <RadixPopover.Trigger asChild>
        {children}
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content className='popover'>
          {content}
          <RadixPopover.Arrow className='popover__arrow' />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};

export default Popover;
