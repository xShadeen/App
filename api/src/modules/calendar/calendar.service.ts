import { google, calendar_v3 } from "googleapis";
import path from "path";
import { prisma } from "../../prisma";

export class CalendarService {
  async sync() {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(
        process.cwd(),
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY!,
      ),
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({
      version: "v3",
      auth,
    });

    const now = new Date();

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const twoMonthsAhead = new Date(now);
    twoMonthsAhead.setMonth(twoMonthsAhead.getMonth() + 2);

    const timeMin = (
      process.env.CALENDAR_SYNC_FROM
        ? new Date(process.env.CALENDAR_SYNC_FROM)
        : startOfYear
    ).toISOString();

    const timeMax = (
      process.env.CALENDAR_SYNC_TO
        ? new Date(process.env.CALENDAR_SYNC_TO)
        : twoMonthsAhead
    ).toISOString();

    const allEvents: calendar_v3.Schema$Event[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const res: { data: calendar_v3.Schema$Events } = await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        singleEvents: true,
        orderBy: "startTime",
        timeMin,
        timeMax,
        maxResults: 2500,
        pageToken,
      });
      allEvents.push(...(res.data.items ?? []));
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    const students = await prisma.student.findMany({
      select: { id: true, firstName: true },
    });
    const studentByName = new Map(students.map((s) => [s.firstName, s.id]));

    const eventIds = allEvents
      .map((e) => e.id)
      .filter((id): id is string => typeof id === "string");

    const existing = await prisma.lesson.findMany({
      where: { googleEventId: { in: eventIds } },
      select: { googleEventId: true },
    });
    const existingIds = new Set(existing.map((l) => l.googleEventId));

    const toCreate: { date: Date; googleEventId: string; studentId: number }[] = [];

    for (const event of allEvents) {
      if (!event.summary || !event.id) continue;
      if (existingIds.has(event.id)) continue;

      const studentId = studentByName.get(event.summary.trim());
      if (studentId === undefined) continue;

      const date = event.start?.dateTime ?? event.start?.date;
      if (!date) continue;

      toCreate.push({
        date: new Date(date),
        googleEventId: event.id,
        studentId,
      });
    }

    if (toCreate.length > 0) {
      await prisma.lesson.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }

    return {
      eventsFetched: allEvents.length,
      lessonsCreated: toCreate.length,
    };
  }
}
