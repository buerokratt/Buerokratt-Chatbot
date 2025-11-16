import { FC, PropsWithChildren, useState } from 'react';
import * as RadixCollapsible from '@radix-ui/react-collapsible';
import {
  MdArrowCircleUp,
  MdArrowDownward,
  MdArrowDropDown,
  MdOutlineAddBox,
  MdOutlineChevronLeft,
  MdOutlineIndeterminateCheckBox,
} from 'react-icons/md';

import { Icon, Track } from 'components';
import './Collapsible.scss';
import { CgChevronDown, CgChevronUp } from 'react-icons/cg';

type CollapsibleProps = {
  title: string;
  defaultOpen?: boolean;
  headerDivider?: boolean;
  headerColor?: string;
  headerBackgroundColor?: string;
  appearance?: 'normal' | 'button';
};

const Collapsible: FC<PropsWithChildren<CollapsibleProps>> = ({
  defaultOpen = false,
  title,
  headerDivider,
  appearance = 'button',
  headerColor,
  headerBackgroundColor,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <RadixCollapsible.Root
      className="collapsible"
      open={open}
      onOpenChange={setOpen}
    >
      <RadixCollapsible.Trigger
        asChild
        className="collapsible__trigger"
        style={{
          borderBottom: headerDivider === false ? 'none' : undefined,
          height: appearance === 'button' ? undefined : '50px',
          backgroundColor: headerBackgroundColor,
        }}
      >
        {appearance === 'normal' ? (
          <div className="collapsible__header">
            <Track
              justify="between"
              align="center"
              gap={8}
              style={{ width: '100%' }}
            >
              <h5 style={{color: headerColor}}>{title}</h5>
              <Icon
                icon={open ? <CgChevronUp color={headerColor} /> : <CgChevronDown color={headerColor} />}
                size="medium"
              />
            </Track>
          </div>
        ) : (
          <button>
            <Icon
              icon={
                open ? <MdOutlineIndeterminateCheckBox color={headerColor} /> : <MdOutlineAddBox color={headerColor} />
              }
              size="medium"
            />
            <h3 className="h6" style={{color: headerColor}}>{title}</h3>
          </button>
        )}
      </RadixCollapsible.Trigger>
      <RadixCollapsible.Content className="collapsible__content">
        {children}
      </RadixCollapsible.Content>
    </RadixCollapsible.Root>
  );
};

export default Collapsible;
