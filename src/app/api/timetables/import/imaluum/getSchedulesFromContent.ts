import * as cheerio from "cheerio";
import capitalize from "@/utils/common/strings/capitalize";
import getTimestamps from "./getTimestamps";

export default function getSchedulesFromContent(content: string): Schedule[] {
  const $ = cheerio.load(content);
  let schedules: Schedule[] = [];

  // Get and iterate the table rows
  const rows = $("table > tbody > tr");
  rows.each((i, row) => {
    const cells = $(row).find("td");

    const code = $(cells[0]).text();
    const title = $(cells[1]).text();
    const sect = $(cells[2]).text();
    const chr = $(cells[3]).text();
    const status = $(cells[4]).text();
    const day = $(cells[5]).text();
    const time = $(cells[6]).text();
    const venue = $(cells[7]).text();
    const lecturer = $(cells[8]).text();

    // If the status is not "Registered", skip
    if (status !== "Registered") return;

    // Check if day and time are not empty
    if (day === "" || time === "") return;

    schedules.push({
      code: code,
      title: capitalize(title),
      section: parseInt(sect),
      creditHours: parseFloat(chr),
      lecturer: capitalize(lecturer),
      venue: venue,
      weekTimes: getTimestamps(day, time),
    });
  });

  return schedules;
}
