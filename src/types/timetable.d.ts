type Timetable = {
  title: string;
  university: string;
  year: string;
  semester: number;
  schedules: Schedule[];
};

type Schedule = {
  code: string;
  title: string;
  section: number;
  creditHours: number;
  lecturer: string;
  venue: string;
  weekTimes: WeekTime[];
};

type WeekTime = {
  start: string;
  end: string;
  day: number;
};
