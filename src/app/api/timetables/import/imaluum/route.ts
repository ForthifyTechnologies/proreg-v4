import got from "got";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { CookieJar } from "tough-cookie";
import getSchedulesFromContent, {
	getSchedulesFromContentNew,
} from "./getSchedulesFromContent";
import getSessions, { getSessionsNew } from "./getSessions";

const IMALUUM_CAS_URL =
	"https://cas.iium.edu.my:8448/cas/login?service=https%3a%2f%2fimaluum.iium.edu.my%2fhome";
const IMALUUM_LOGIN_URL =
	"https://cas.iium.edu.my:8448/cas/login?service=https%3a%2f%2fimaluum.iium.edu.my%2fhome?service=https%3a%2f%2fimaluum.iium.edu.my%2fhome";
const IMALUUM_SCHEDULE_PAGE = "https://imaluum.iium.edu.my/MyAcademic/schedule";

export async function POST(request: NextRequest) {
	const cookieJar = new CookieJar();
	const _cookie = request.headers.get("cookie");
	console.log("request cookie", _cookie);

	const { username, password, year, semester } = await request.json();

	/**
	 * Attempt to login to iMaalum
	 * to get the auth cookies
	 */

	if (
		_cookie?.split("=")[0] !== "MOD_AUTH_CAS" ||
		_cookie.length === 0 ||
		_cookie === null
	) {
		console.log("Logging in");
		const payload = new URLSearchParams({
			username,
			password,
			execution: "e1s1",
			_eventId: "submit",
			geolocation: "",
		});

		await got(IMALUUM_CAS_URL, {
			cookieJar,
			https: { rejectUnauthorized: false },
			followRedirect: false,
		});

		try {
			const { headers } = await got.post(IMALUUM_LOGIN_URL, {
				cookieJar,
				https: { rejectUnauthorized: false },
				body: payload.toString(),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Referer: IMALUUM_CAS_URL,
				},
				followRedirect: false,
			});

			await got(headers.location as string, {
				cookieJar,
				https: { rejectUnauthorized: false },
				followRedirect: false,
			});
		} catch (error) {
			// If the login fails, return an error
			// Generally this happens when the username or password is incorrect
			// So we return a 401 status code
			return NextResponse.json({}, { status: 401 });
		}

		const cookieStore = cookieJar.toJSON().cookies;
		// console.log(cookieStore);

		if (cookieStore.length === 0) {
			// This could be redundant but just in case
			return NextResponse.json({}, { status: 401 });
		}

		for (const cookie of cookieStore) {
			if (cookie.key === "MOD_AUTH_CAS") {
				cookies().set({
					name: "MOD_AUTH_CAS",
					value: cookie.value,
					expires: new Date(Date.now() + 10 * 60 * 1000),
				});
				break;
			}
		}
	} else {
		console.log("Using existing cookie");
		cookieJar.setCookieSync(_cookie, IMALUUM_CAS_URL);
		cookies().set({
			name: "MOD_AUTH_CAS",
			value: _cookie.split("=")[1],
			expires: new Date(Date.now() + 10 * 60 * 1000),
		});
	}
	/**
	 * Get the schedule page data
	 */

	// Get the schedule page
	// Include the GET params if session and semester are provided
	console.log(
		"requesting to: ",
		IMALUUM_SCHEDULE_PAGE +
			(year && semester ? `?ses=${year}&sem=${semester}` : ""),
	);

	const response = await got(
		IMALUUM_SCHEDULE_PAGE +
			(year && semester ? `?ses=${year}&sem=${semester}` : ""),
		{
			headers: {
				Cookie: cookies().toString(),
			},
			https: { rejectUnauthorized: false },
			followRedirect: false,
		},
	);

	// Scrape and store the schedules
	const schedules = getSchedulesFromContentNew(response.body);

	// Get the list of sessions excluding the recently scraped one
	// const { currentSession, sessions } = getSessions(response.body);
	const { currentSession, sessions } = getSessionsNew(response.body);

	console.log(parseInt(currentSession.year.split("/")[0]));
	console.log(parseInt(sessions[0].year.split("/")[0]) + 1);

	// Calculate the year based on the session
	const yearNo =
		parseInt(currentSession.year.split("/")[0]) -
		parseInt(sessions[0].year.split("/")[0]) +
		1;

	console.log("Year no: ", yearNo);

	// Timetable data
	const timetable: Timetable = {
		title: `Year ${yearNo} Semester ${currentSession.semester}`,
		university: "IIUM",
		year: currentSession.year,
		semester: currentSession.semester,
		schedules: schedules,
	};

	console.log("Timetable: ", timetable);
	console.log("Sessions: ", sessions);

	return NextResponse.json(
		{ timetable, sessions, cookieStore: cookieJar.toJSON().cookies },
		{ status: 200 },
	);
}
