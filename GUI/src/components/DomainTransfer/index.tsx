import { Button, Dialog, FormMultiselect, Track } from 'components';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdContentCopy } from 'react-icons/md';

type SelectOption = { label: string; value: string };

type DomainTransferProps = {
  readonly allDomains: SelectOption[];
  readonly excludedDomainIds: string[];
  readonly onTransfer: (targetIds: string[]) => void;
  readonly isTransferring?: boolean;
};

const DomainTransfer: FC<DomainTransferProps> = ({
  allDomains,
  excludedDomainIds,
  onTransfer,
  isTransferring = false,
}) => {
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<SelectOption[]>([]);

  const targetOptions = allDomains.filter((d) => !excludedDomainIds.includes(d.value));

  const handleConfirm = () => {
    if (selectedTargets.length === 0) return;
    onTransfer(selectedTargets.map((d) => d.value));
    setShowDialog(false);
    setSelectedTargets([]);
  };

  const handleClose = () => {
    setShowDialog(false);
    setSelectedTargets([]);
  };

  return (
    <>
      <Button appearance="text" size="s" onClick={() => setShowDialog(true)}>
        <Track gap={8} align="center">
          <MdContentCopy />
          {t('domainTransfer.copyFromDomain')}
        </Track>
      </Button>

      {showDialog && (
        <Dialog
          title={t('domainTransfer.copyFromDomain')}
          onClose={handleClose}
          footer={
            <>
              <Button appearance="secondary" onClick={handleClose}>
                {t('global.cancel')}
              </Button>
              <Button
                appearance={isTransferring ? 'loading' : 'primary'}
                disabled={selectedTargets.length === 0 || isTransferring}
                onClick={handleConfirm}
              >
                {t('domainTransfer.transfer')}
              </Button>
            </>
          }
        >
          <Track direction="vertical" gap={8} align="left">
            <p>{t('domainTransfer.transferDescription')}</p>
            <FormMultiselect
              name="transfer-target-domains"
              label={t('domainTransfer.selectTargetDomain')}
              options={targetOptions}
              selectedOptions={selectedTargets}
              onSelectionChange={(opts) => setSelectedTargets(opts ?? [])}
            />
          </Track>
        </Dialog>
      )}
    </>
  );
};

export default DomainTransfer;
