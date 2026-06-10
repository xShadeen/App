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
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const timeMin = (
      process.env.CALENDAR_SYNC_FROM
        ? new Date(process.env.CALENDAR_SYNC_FROM)
        : startOfYear
    ).toISOString();

    const timeMax = (
      process.env.CALENDAR_SYNC_TO
        ? new Date(process.env.CALENDAR_SYNC_TO)
        : endOfYear
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

    const activeEvents = allEvents.filter(
      (e) => e.id && e.status !== "cancelled",
    );

    const activeEventIdSet = new Set(
      activeEvents.map((e) => e.id as string),
    );

    const timeMinDate = new Date(timeMin);
    const timeMaxDate = new Date(timeMax);

    const desiredLessons: {
      date: Date;
      googleEventId: string;
      studentId: number;
    }[] = [];

    for (const event of activeEvents) {
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

      const lessonDate = new Date(date);

      for (const studentId of matchedStudentIds) {
        desiredLessons.push({
          date: lessonDate,
          googleEventId: event.id,
          studentId,
        });
      }
    }

    const lessonKey = (
      googleEventId: string,
      studentId: number,
      date: Date,
    ) => `${googleEventId}:${studentId}:${date.getTime()}`;

    const desiredKeys = new Set(
      desiredLessons.map((l) =>
        lessonKey(l.googleEventId, l.studentId, l.date),
      ),
    );

    const lessonsInRange = await prisma.lesson.findMany({
      where: {
        date: { gte: timeMinDate, lte: timeMaxDate },
      },
      select: { id: true, googleEventId: true, studentId: true, date: true },
    });

    const toDeleteIds = lessonsInRange
      .filter((lesson) => {
        if (!activeEventIdSet.has(lesson.googleEventId)) return true;
        return !desiredKeys.has(
          lessonKey(lesson.googleEventId, lesson.studentId, lesson.date),
        );
      })
      .map((lesson) => lesson.id);

    if (toDeleteIds.length > 0) {
      await prisma.lesson.deleteMany({
        where: { id: { in: toDeleteIds } },
      });
    }

    const deletedIdSet = new Set(toDeleteIds);
    const remainingKeys = new Set(
      lessonsInRange
        .filter((lesson) => !deletedIdSet.has(lesson.id))
        .map((lesson) =>
          lessonKey(lesson.googleEventId, lesson.studentId, lesson.date),
        ),
    );

    const toCreate = desiredLessons.filter(
      (lesson) =>
        !remainingKeys.has(
          lessonKey(lesson.googleEventId, lesson.studentId, lesson.date),
        ),
    );

    if (toCreate.length > 0) {
      await prisma.lesson.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }

    return {
      eventsFetched: allEvents.length,
      lessonsCreated: toCreate.length,
      lessonsDeleted: toDeleteIds.length,
    };
  }
}
