import { google, calendar_v3 } from "googleapis";
import path from "path";
import { prisma } from "../../prisma";

export class CalendarService {
  async sync() {
    const googleServiceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const googleCalendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!googleServiceAccountKey) {
      throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY in environment.");
    }

    if (!googleCalendarId) {
      throw new Error("Missing GOOGLE_CALENDAR_ID in environment.");
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(
        process.cwd(),
        googleServiceAccountKey,
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
        calendarId: googleCalendarId,
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
      select: {
        id: true,
        firstName: true,
        groupId: true,
        group: { select: { name: true } },
      },
    });

    const eventIds = allEvents
      .map((e) => e.id)
      .filter((id): id is string => typeof id === "string");

    const existing = await prisma.lesson.findMany({
      where: { googleEventId: { in: eventIds } },
      select: { googleEventId: true, studentId: true },
    });
    const existingKeys = new Set(
      existing.map((l) => `${l.googleEventId}:${l.studentId}`),
    );

    const toCreate: { date: Date; googleEventId: string; studentId: number }[] = [];

    for (const event of allEvents) {
      if (!event.summary || !event.id) continue;

      const summary = event.summary.trim();
      const matchedStudentIds = new Set<number>();

      for (const student of students) {
        if (student.group?.name === summary) {
          matchedStudentIds.add(student.id);
        } else if (!student.groupId && student.firstName === summary) {
          matchedStudentIds.add(student.id);
        }
      }

      if (matchedStudentIds.size === 0) continue;

      const date = event.start?.dateTime ?? event.start?.date;
      if (!date) continue;

      for (const studentId of matchedStudentIds) {
        const key = `${event.id}:${studentId}`;
        if (existingKeys.has(key)) continue;

        toCreate.push({
          date: new Date(date),
          googleEventId: event.id,
          studentId,
        });
        existingKeys.add(key);
      }
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
