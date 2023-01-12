import { FC, PropsWithChildren, useState } from 'react';
import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { MdOutlineAddBox, MdOutlineIndeterminateCheckBox } from 'react-icons/md';

import { Icon } from 'components';
import './Collapsible.scss';

type CollapsibleProps = {
  title: string;
  defaultOpen?: boolean;
}

const Collapsible: FC<PropsWithChildren<CollapsibleProps>> = ({ defaultOpen = false, title, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <RadixCollapsible.Root className='collapsible' open={open} onOpenChange={setOpen}>
      <RadixCollapsible.Trigger asChild className='collapsible__trigger'>
        <button>
          <Icon icon={open ? <MdOutlineIndeterminateCheckBox /> : <MdOutlineAddBox />} size='medium' />
          <h3 className='h6'>{title}</h3>
        </button>
      </RadixCollapsible.Trigger>
      <RadixCollapsible.Content className='collapsible__content'>
        {children}
      </RadixCollapsible.Content>
    </RadixCollapsible.Root>
  );
};

export default Collapsible;
