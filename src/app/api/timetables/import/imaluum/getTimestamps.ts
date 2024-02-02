import moment from "moment";

export default function getTimestamps(day: string, time: string): WeekTime[] {
  // Every scraped day may contain two days
  // E.g: M-W, T-TH
  let days = day.replace(/ /gi, "").split("-");

  // Get the AM or PM of time
  let m = time.slice(-2);

  // Get the start and end times in array
  // times[0] is the start time
  // times[1] is the end time
  let times = time.replace(/ |am|pm/gi, "").split("-");

  // times = times.map((x) => {
  //   let t = parseFloat(x)
  //   return Math.floor(t) + (t % 1) / .6
  // })
  let start: any = null;
  let end: any = null;
  let t0 = parseFloat(times[0]);
  let t1 = parseFloat(times[1]);

  // Check if the time is in 12-hour format or 24-hour format
  if (m == "AM" || m == "PM") {
    // 12-hour format

    // It's illogical to have a schedule longer than 12 hours
    // that the start time is smaller than the end time
    if (t0 > t1) {
      start = moment({
        h: Math.floor(t0),
        m: Math.round((t0 - Math.floor(t0)) * 100),
      }); // AM
      end = moment({
        h: Math.floor(t1) + 12,
        m: Math.round((t1 - Math.floor(t1)) * 100),
      }); // PM
    } else if (m.toLowerCase() == "am" || Math.floor(t1) == 12) {
      start = moment({
        h: Math.floor(t0),
        m: Math.round((t0 - Math.floor(t0)) * 100),
      }); // AM
      end = moment({
        h: Math.floor(t1),
        m: Math.round((t1 - Math.floor(t1)) * 100),
      }); // AM
    } else {
      start = moment({
        h: Math.floor(t0) + 12,
        m: Math.round((t0 - Math.floor(t0)) * 100),
      }); // AM
      end = moment({
        h: Math.floor(t1) + 12,
        m: Math.round((t1 - Math.floor(t1)) * 100),
      }); // AM
    }
  } else {
    // 24-hour format

    // Example: 1130 - 1250
    // Should turn into:
    // start = 11.3
    // end = 12.5

    const h0 = Math.floor(t0 / 100);
    const h1 = Math.floor(t1 / 100);
    start = moment({
      h: h0,
      m: Math.round(t0 - h0 * 100),
    });
    end = moment({
      h: h1,
      m: Math.round(t1 - h1 * 100),
    });
  }
  start = start.format("HH:mm");
  end = end.format("HH:mm");

  // return [
  //   {start, hrs, day},
  //   {...},
  //   ...
  // ]
  return days.map((x) => {
    let d = 0; // SUN
    if (x == "M" || x == "MON") d = 1;
    else if (x == "T" || x == "TUE") d = 2;
    else if (x == "W" || x == "WED") d = 3;
    else if (x == "TH" || x == "THUR" || x == "THU") d = 4;
    else if (x == "F" || x == "FRI") d = 5;
    else if (x == "SAT") d = 6;
    else if (x == "SUN") d = 0;
    return {
      start,
      end,
      day: d,
    };
  });
}
