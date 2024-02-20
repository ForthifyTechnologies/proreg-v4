import capitalize from "@/utils/common/strings/capitalize";
import * as cheerio from "cheerio";
import { parse } from "node-html-parser";
import getTimestamps from "./getTimestamps";

export default function getSchedulesFromContent(content: string): Schedule[] {
	// console.time("getSchedulesFromContent");
	const $ = cheerio.load(content);
	const schedules: Schedule[] = [];

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

	// console.timeEnd("getSchedulesFromContent");

	return schedules;
}

export function getSchedulesFromContentNew(content: string) {
	// console.time("getSchedulesFromContentNew");
	const root = parse(content);

	const table = root.querySelector(".box-body table.table.table-hover");
	const rows = table?.querySelectorAll("tr") ?? [];

	const schedules: Schedule[] = [];

	// @ts-ignore
	for (const row of rows) {
		const tds = row.querySelectorAll("td");
		if (tds.length === 0) continue;

		if (tds.length === 9) {
			const code = tds[0].textContent.trim();
			const title = tds[1].textContent.trim();
			const sect = tds[2].textContent.trim();
			const chr = tds[3].textContent.trim();
			const status = tds[4].textContent.trim();
			if (status !== "Registered") continue;
			const day = tds[5].textContent.trim();
			if (day === "" || day === null) continue;
			const time = tds[6].textContent.trim();
			if (time === "" || time === null) continue;
			const venue = tds[7].textContent.trim();
			const lecturer = tds[8].textContent.trim();

			schedules.push({
				code: code,
				title: capitalize(title),
				section: parseInt(sect),
				creditHours: parseFloat(chr),
				lecturer: capitalize(lecturer),
				venue: venue,
				weekTimes: getTimestamps(day, time),
			});
		}

		// if (tds.length === 4) {
		// 	const day = tds[5].textContent.trim();
		// 	if (day === "" || day === null) continue;
		// 	const time = tds[6].textContent.trim();
		// 	if (time === "" || time === null) continue;
		// 	const venue = tds[7].textContent.trim();
		// 	const lecturer = tds[8].textContent.trim();

		// 	schedules.push({
		// 		code: schedules[schedules.length - 1].code,
		// 		title: schedules[schedules.length - 1].title,
		// 		section: schedules[schedules.length - 1].section,
		// 		creditHours: schedules[schedules.length - 1].creditHours,
		// 		lecturer: capitalize(lecturer),
		// 		venue: venue,
		// 		weekTimes: getTimestamps(day, time),
		// 	});
		// }
	}

	// console.timeEnd("getSchedulesFromContentNew");

	return schedules;
}
