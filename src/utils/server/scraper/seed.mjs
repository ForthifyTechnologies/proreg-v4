import fs from "fs";

const KULY = [
	"KAHS",
	"AED",
	"BRIDG",
	"CFL",
	"CCAC",
	"DENT",
	"EDUC",
	"ENGIN",
	"ECONS",
	"KICT",
	"IHART",
	"IRKHS",
	"IIBF",
	"ISTAC",
	"KLM",
	"LAWS",
	"NURS",
	"PHARM",
	"KOS",
	"SC4SH",
];

const session = "2023_2024";
const semester = 2;

// type Schedule = {
//   code: string;
//   title: string;
//   section: number;
//   creditHours: number;
//   lecturer: string;
//   venue: string;
//   weekTimes: WeekTime[];
// };

async function main() {
	console.time("fetching");
	const allData = []; // Array to store data for each kuly

	// Create an array of promises for each fetch request
	const fetchPromises = KULY.map(async (kuly) => {
		const res = await fetch(
			`https://raw.githubusercontent.com/iqfareez/albiruni_fetcher/master/db/${session}/${semester}/${kuly}.json`,
		);
		const data = await res.json();

		if (data.length > 0) {
			const ses = "2023/2024";
			const sem = 2;
			for (const x of data) {
				// ---data cleaning---

				if (x.dayTime.length === 0) continue;

				// ---data cleaning---

				const timestamps = [];
				for (const y of x.dayTime) {
					timestamps.push({
						day: y.day,
						start: y.startTime,
						end: y.endTime,
					});
				}
				allData.push({
					code: x.code,
					title: x.title,
					section: x.sect,
					creditHours: x.chr,
					lecturer: x.lect,
					venue: x.venue,
					weekTimes: timestamps,
				});

				// allData.push({
				// 	course: {
				// 		code: x.code,
				// 		name: x.title,
				// 		credit_hours: x.chr,
				// 		university: "IIUM",
				// 		faculty: kuly,
				// 	},
				// 	section: x.sect,
				// 	session: ses,
				// 	semester: sem,
				// 	venues: x.venue,
				// 	lecturers: x.lect,
				// 	week_times: timestamps,
				// });
			}
		}
	});

	// Wait for all promises to resolve
	await Promise.all(fetchPromises);

	// Write the data to a file
	const jsonData = JSON.stringify(allData, null, 2);

	fs.writeFileSync("./data.json", jsonData);

	console.timeEnd("fetching");
}

main();
