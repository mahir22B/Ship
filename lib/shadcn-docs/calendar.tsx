export const name = "Calendar";
export const importDocs = `
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from "@/components/ui/date-picker"
`;
export const usageDocs = `
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
  disabled={(date) =>
    date > new Date() || date < new Date("1900-01-01")
  }
/>

<Calendar
  mode="range"
  selected={dateRange}
  onSelect={setDateRange}
  numberOfMonths={2}
  className="rounded-md border"
/>
`;