import { FC, useId, useState } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import clsx from 'clsx';
import { et } from 'date-fns/locale';
import { MdChevronRight, MdChevronLeft, MdOutlineToday } from 'react-icons/md';

import { Icon } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import './FormDatepicker.scss';

registerLocale('et-EE', et);

type FormDatepickerProps = {
  label: string;
  name: string;
  hideLabel?: boolean;
  disabled?: boolean;
  placeholder?: string;
  timePicker?: boolean;
}

const FormDatepicker: FC<FormDatepickerProps> = ({ label, name, hideLabel, disabled, placeholder, timePicker }) => {
  const id = useId();
  const [date, setDate] = useState<Date | null>(null);

  const datepickerClasses = clsx(
    'datepicker',
    disabled && 'datepicker--disabled',
  );

  return (
    <div className={datepickerClasses}>
      {label && !hideLabel && <label htmlFor={id} className='datepicker__label'>{label}</label>}
      <div className='datepicker__wrapper'>
        <ReactDatePicker
          selected={date}
          onChange={setDate}
          dateFormat='dd.MM.yyyy'
          locale='et-EE'
          placeholderText={placeholder}
          previousMonthButtonLabel={<MdChevronLeft />}
          nextMonthButtonLabel={<MdChevronRight />}
          aria-label={hideLabel ? label : undefined}
          showTimeSelect={timePicker}
          showTimeSelectOnly={timePicker}
          portalId="overlay-root"
        />
        <Icon icon={<MdOutlineToday color='#5D6071' fontSize={18} />} size='medium' />
      </div>
    </div>
  );
};

export default FormDatepicker;
