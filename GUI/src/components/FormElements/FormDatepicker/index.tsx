import { forwardRef, useId } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import clsx from 'clsx';
import { et } from 'date-fns/locale';
import { ControllerRenderProps } from 'react-hook-form';
import {
  MdChevronRight,
  MdChevronLeft,
  MdOutlineToday,
  MdOutlineSchedule,
} from 'react-icons/md';

import { Icon } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import './FormDatepicker.scss';

registerLocale('et-EE', et);

type FormDatepickerProps = ControllerRenderProps & {
  label: string;
  name: string;
  hideLabel?: boolean;
  disabled?: boolean;
  placeholder?: string;
  timePicker?: boolean;
  direction?: 'row' | 'column';
};

const FormDatepicker = forwardRef<any, FormDatepickerProps>(
  (
    {
      label,
      name,
      hideLabel,
      disabled,
      placeholder,
      timePicker,
      direction = 'column',
      ...rest
    },
    ref
  ) => {
    const id = useId();
    const { value, onChange } = rest;

    const datepickerClasses = clsx(
      'datepicker',
      disabled && 'datepicker--disabled'
    );

    return (
      <div className={datepickerClasses}>
        {label && !hideLabel && (
          <label htmlFor={id} className="datepicker__label">
            {label}
          </label>
        )}
        <div
          className={
            direction === 'column'
              ? 'datepicker__wrapper_column'
              : 'datepicker__wrapper_row'
          }
        >
          <ReactDatePicker
            selected={new Date(value)}
            dateFormat={timePicker ? 'HH:mm:ss' : 'dd.MM.yyyy'}
            locale="et-EE"
            placeholderText={placeholder}
            previousMonthButtonLabel={<MdChevronLeft />}
            nextMonthButtonLabel={<MdChevronRight />}
            aria-label={hideLabel ? label : undefined}
            showTimeSelect={timePicker}
            showTimeSelectOnly={timePicker}
            timeIntervals={15}
            timeFormat="HH:mm:ss"
            timeInputLabel=""
            portalId="overlay-root"
            {...rest}
            onChange={onChange}
          />
          <Icon
            icon={
              timePicker ? (
                <MdOutlineSchedule color="#5D6071" fontSize={20} />
              ) : (
                <MdOutlineToday color="#5D6071" fontSize={20} />
              )
            }
            size="medium"
          />
        </div>
      </div>
    );
  }
);

export default FormDatepicker;
