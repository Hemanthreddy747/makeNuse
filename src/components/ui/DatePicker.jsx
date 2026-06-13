import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar } from 'lucide-react'
import { createPortal } from 'react-dom'

const PopperContainer = ({ children }) => createPortal(children, document.body)

export default function DatePickerField({ value, onChange, className = '', minDate, maxDate, ...props }) {
  const date = value ? new Date((value.split('T')[0]) + 'T00:00:00') : null

  const handleChange = (date) => {
    const dateStr = date ? date.toISOString().split('T')[0] : ''
    onChange({ target: { value: dateStr } })
  }

  return (
    <div className={`date-picker ${className}`}>
      <DatePicker
        selected={date}
        onChange={handleChange}
        dateFormat="dd-MM-yyyy"
        className="date-picker-input"
        wrapperClassName="date-picker-wrapper"
        popperPlacement="bottom-start"
        popperContainer={PopperContainer}
        minDate={minDate}
        maxDate={maxDate}
        {...props}
      />
      <Calendar size={16} className="date-picker-icon" />
    </div>
  )
}
