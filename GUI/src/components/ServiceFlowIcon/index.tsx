import { FC } from 'react';
import { TbSitemap } from 'react-icons/tb';

type ServiceFlowIconProps = {
  color?: string;
  size?: number;
};

const ServiceFlowIcon: FC<ServiceFlowIconProps> = ({ color = '#003cff', size = 20 }) => (
  <TbSitemap aria-hidden color={color} size={size} strokeWidth={1.75} />
);

export default ServiceFlowIcon;
