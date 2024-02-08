import * as cheerio from "cheerio";
import { parse } from "node-html-parser";

type Session = {
	year: string;
	semester: number;
};

export default function getSessions(content: string): {
	currentSession: Session;
	sessions: Session[];
} {
	// console.time("getSessions");
	console.log("getSessions");
	const $ = cheerio.load(content);

	const temp = $("h3.box-title").text().trim().replace(",", "").split(" ");
	const currentSession: Session = {
		year: temp.at(-1) || "",
		semester: parseInt(temp.at(-2) || "0"),
	};
	const sessions: Session[] = $("ul.dropdown-menu > li > a")
		.map((i, el) => ({
			// Original string: Sem X, 20XX/20XX

			// Get session: 20XX/20XX
			year: $(el).text().split(", ")[1],

			// Get semester: X
			semester: parseInt($(el).text().split(", ")[0].split(" ")[1]),
		}))
		.get()
		.reverse();

	// console.timeEnd("getSessions");

	return { currentSession, sessions };
}

// optimized version
export function getSessionsNew(content: string) {
	// console.time("getSessionsNew");
	console.log("getSessionsNew");

	const root = parse(content);

	const sessionBody = root.querySelectorAll(
		".box.box-primary .box-header.with-border .dropdown ul.dropdown-menu li[style*='font-size:16px']",
	);

	const temp = root
		.querySelector(".box.box-primary .box-header.with-border h3.box-title")
		.textContent.trim()
		.replace(", ", " ")
		.split(" ");

	const sessionList = sessionBody.map((element) => {
		const row = element;
		const sessionName = row.querySelector("a")?.textContent.trim();
		return sessionName;
	});

	sessionList.reverse();

	if (sessionList.length === 0) {
		throw new Error("Session list not found");
	}

	const sessions: Session[] = sessionList.map((session) => {
		return {
			year: session.split(", ")[1].trim(),
			semester: parseInt(session.split(", ")[0].split(" ")[1].trim()),
		};
	});

	const currentSession: Session = {
		year: temp.at(-1) || "",
		semester: parseInt(temp.at(-2) || "0"),
	};

	console.log("currentSession: ", currentSession);

	// console.timeEnd("getSessionsNew");

	return { currentSession, sessions: sessions };
}
