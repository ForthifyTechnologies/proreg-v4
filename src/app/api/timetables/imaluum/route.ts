import { type NextRequest, NextResponse } from "next/server";
import IMALUUMSCHEDULE from "/data.json";

export async function GET(request: NextRequest) {
	const url = new URL(request.url);

	const subject = url.searchParams.get("subject");

	if (subject) {
		const schedules = IMALUUMSCHEDULE.filter(
			(schedule) =>
				schedule.course.code.toLowerCase().includes(subject.toLowerCase()) ||
				schedule.course.name.toLowerCase().includes(subject.toLowerCase()),
		);

		return NextResponse.json(schedules);
	}

	return NextResponse.json(IMALUUMSCHEDULE);
}
