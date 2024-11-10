// @ts-nocheck

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DateTimePicker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedule, setSchedule] = useState<Date | null>(null);


  return (
    <div>
      <h2>Select Date and Time</h2>
      <DatePicker
        selected={schedule}
        onChange={(date: Date | null) => {
          setSchedule(date);
          console.log("Selected date:", date); // Verify date update here
        }}
        showTimeSelect
        dateFormat="Pp"
        placeholderText="Select a date and time"
      />
      <p>
        Selected Schedule: {schedule ? schedule.toLocaleString() : 'None'}
      </p>
    </div>
  );
};

export default DateTimePicker;
