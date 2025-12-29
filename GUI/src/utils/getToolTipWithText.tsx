import { Tooltip } from 'components';
import { useTranslation } from 'react-i18next';
import { AiOutlineInfoCircle } from 'react-icons/ai';

import Icon from '../components/Icon';

interface TooltipProps {
  name: string;
}

export const InfoTooltip: React.FC<TooltipProps> = ({ name }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip content={t(name)}>
        <span>
          <Icon
            style={{ paddingTop: '6px' }}
            icon={<AiOutlineInfoCircle fontSize={20} color="#005aa3" />}
            size="medium"
          />
        </span>
      </Tooltip>
    </div>
  );
};
