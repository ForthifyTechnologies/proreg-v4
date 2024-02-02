import got from "got";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CookieJar } from "tough-cookie";
import getSchedulesFromContent from "./getSchedulesFromContent";
import getSessions from "./getSessions";

const IMALUUM_CAS_URL =
  "https://cas.iium.edu.my:8448/cas/login?service=https%3a%2f%2fimaluum.iium.edu.my%2fhome";
const IMALUUM_LOGIN_URL =
  "https://cas.iium.edu.my:8448/cas/login?service=https%3a%2f%2fimaluum.iium.edu.my%2fhome?service=https%3a%2f%2fimaluum.iium.edu.my%2fhome";
const IMALUUM_SCHEDULE_PAGE = "https://imaluum.iium.edu.my/MyAcademic/schedule";

export async function POST(request: Request) {
  const cookieJar = new CookieJar();

  const { username, password } = await request.json();

  /**
   * Attempt to login to iMaalum
   * to get the auth cookies
   */

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

  /**
   * Get the schedule page data
   */

  const response = await got(IMALUUM_SCHEDULE_PAGE, {
    headers: {
      Cookie: cookies().toString(),
    },
    https: { rejectUnauthorized: false },
    followRedirect: false,
  });

  // Scrape and store the schedule data inside a temp variable
  let timetables: Timetable[] = [];
  const currentSchedules = getSchedulesFromContent(response.body);

  // Get the list of sessions excluding the recently scraped one
  const { currentSession, sessions } = getSessions(response.body);

  // Loop through the list of sessions and scrape the schedule data
  for (const session of sessions) {
    let schedules: Schedule[] = [];

    // If is current schedule, use previously scraped data
    if (
      session.session === currentSession.session &&
      session.semester === currentSession.semester
    )
      schedules = currentSchedules;
    // Else get the schedule page data
    else {
      const response = await got(
        IMALUUM_SCHEDULE_PAGE +
          `?ses=${session.session}&sem=${session.semester}`,
        {
          headers: {
            Cookie: cookies().toString(),
          },
          https: { rejectUnauthorized: false },
          followRedirect: false,
        }
      );
      schedules = getSchedulesFromContent(response.body);
    }

    // Calculate the year based on the session
    const year =
      parseInt(session.session.split("/")[0]) -
      parseInt(sessions[0].session.split("/")[0]) +
      1;

    timetables.push({
      title: `Year ${year} Semester ${session.semester}`,
      university: "IIUM",
      session: session.session,
      semester: session.semester,
      schedules: schedules,
    });
  }

  // Merge the temp variable with the schedule data

  /**
   * Logout from iMaalum
   * (clear cookies)
   */

  cookies().delete("MOD_AUTH_CAS");
  cookies().delete("XSRF-TOKEN");
  cookies().delete("laravel_session");

  return NextResponse.json({ timetables }, { status: 200 });
}
