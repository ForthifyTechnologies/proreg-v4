import exp from "constants";
import getTimestamps from "./getTimestamps";

describe("getTimestamps", () => {
  it("should work on 12-hour setting", () => {
    expect(getTimestamps("M-W", "11.30 - 12.50 PM")).toEqual([
      {
        start: "11:30",
        end: "12:50",
        day: 1,
      },
      {
        start: "11:30",
        end: "12:50",
        day: 3,
      },
    ]);

    expect(getTimestamps("T-TH", "2.00 - 3.20 PM")).toEqual([
      {
        start: "14:00",
        end: "15:20",
        day: 2,
      },
      {
        start: "14:00",
        end: "15:20",
        day: 4,
      },
    ]);
  });

  it("should work on 24-hour setting", () => {
    expect(getTimestamps("M-W", "1130 - 1250")).toEqual([
      {
        start: "11:30",
        end: "12:50",
        day: 1,
      },
      {
        start: "11:30",
        end: "12:50",
        day: 3,
      },
    ]);

    expect(getTimestamps("T-TH", "1400 - 1520")).toEqual([
      {
        start: "14:00",
        end: "15:20",
        day: 2,
      },
      {
        start: "14:00",
        end: "15:20",
        day: 4,
      },
    ]);

    expect(getTimestamps("T-TH", "830 - 950")).toEqual([
      {
        start: "08:30",
        end: "09:50",
        day: 2,
      },
      {
        start: "08:30",
        end: "09:50",
        day: 4,
      },
    ]);
  });
});
