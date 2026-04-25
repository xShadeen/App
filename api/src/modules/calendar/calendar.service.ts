import { google } from "googleapis";
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

    const events = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      singleEvents: true,
      orderBy: "startTime",
      timeMin: new Date("2026-01-01").toISOString(),
    });

    let created = 0;

    for (const event of events.data.items ?? []) {
      if (!event.summary) continue;

      const studentName = event.summary.trim();

      const student = await prisma.student.findFirst({
        where: { firstName: studentName },
      });

      if (!student) {
        continue;
      }

      const exists = await prisma.lesson.findUnique({
        where: { googleEventId: event.id! },
      });

      if (exists) continue;

      const date = event.start?.dateTime ?? event.start?.date;

      if (!date) continue;

      await prisma.lesson.create({
        data: {
          date: new Date(date),
          googleEventId: event.id!,
          studentId: student.id,
        },
      });

      created++;
    }

    return {
      eventsFetched: events.data.items?.length ?? 0,
      lessonsCreated: created,
    };
  }
}
