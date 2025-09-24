import { Tooltip } from "components";
import { useTranslation } from "react-i18next";
import Icon from '../components/Icon';

export const getTooltip = (name: string) => {
  const { t } = useTranslation();

  return (
    <Tooltip content = { '' }>
    <span>
      <Icon icon={<AiOutlineInfoCircle fontSize={20} color="#005aa3" />}
  size="medium"
    />
    </span>
    < /Tooltip>;;
)
  ;
};