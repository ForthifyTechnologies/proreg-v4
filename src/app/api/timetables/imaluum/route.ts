import { type NextRequest, NextResponse } from "next/server";
import IMALUUMSCHEDULE from "/data.json";

// how-to:
// - GET /api/timetables/imaluum
// - GET /api/timetables/imaluum?subject=csci
// - GET /api/timetables/imaluum?subject=mathematics

export async function GET(request: NextRequest) {
	const url = new URL(request.url);

	const subject = url.searchParams.get("subject");

	if (subject) {
		const schedules = IMALUUMSCHEDULE.filter(
			(schedule) =>
				schedule.code.toLowerCase().includes(subject.toLowerCase()) ||
				schedule.title.toLowerCase().includes(subject.toLowerCase()) ||
				schedule.lecturer[0].toLowerCase().includes(subject.toLowerCase()) ||
				schedule.lecturer[1]?.toLowerCase().includes(subject.toLowerCase()),
		);

		return NextResponse.json(schedules);
	}

	return NextResponse.json(IMALUUMSCHEDULE);
}
