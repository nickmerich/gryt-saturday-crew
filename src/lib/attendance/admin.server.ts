import { timingSafeEqual } from "node:crypto";
import { isAdminEmail } from "../admin/allowlist";
import { attendanceDatabase, privateJson, smallJson } from "./capture.server";
import { processAttendanceJobs } from "./jobs.server";

function isWorker(request: Request) {
  const expected = process.env.ATTENDANCE_JOB_TOKEN;
  const actual = request.headers.get("x-attendance-job-token");
  return (
    !!expected &&
    expected.length >= 32 &&
    !!actual &&
    Buffer.byteLength(actual) === Buffer.byteLength(expected) &&
    timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  );
}

export async function attendanceAdmin(request: Request, database = attendanceDatabase) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  const worker = isWorker(request);
  if (!token && !worker) return privateJson({ error: "Admin access required." }, 403);
  try {
    const db = await database();
    if (!worker) {
      const { data, error } = await db.auth.getUser(token!);
      if (error || !data.user?.email_confirmed_at || !isAdminEmail(data.user.email))
        return privateJson({ error: "Admin access required." }, 403);
    }
    if (request.method === "GET") {
      if (worker) return privateJson({ error: "Worker cannot read the operator queue." }, 403);
      const { data, error } = await db
        .from("attendance_jobs")
        .select("id,rsvp_id,kind,status,attempts,last_error,created_at,updated_at,next_attempt_at")
        .in("status", ["pending", "processing", "failed", "needs_review"])
        .order("created_at", { ascending: true })
        .limit(100);
      if (error)
        return privateJson(
          { error: "Apply the reviewed attendance migration before using this queue." },
          503,
        );
      return privateJson({ jobs: data, limit: 100, hasMorePossible: data.length === 100 });
    }
    const input = await smallJson(request);
    if (input.action === "process") return privateJson(await processAttendanceJobs(db));
    if (
      !worker &&
      input.action === "retry" &&
      /^[0-9a-f-]{36}$/i.test(input.id) &&
      input.reviewed === true
    ) {
      const { data, error } = await db
        .from("attendance_jobs")
        .update({
          status: "pending",
          attempts: 0,
          last_error: null,
          next_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .eq("status", "failed")
        .select("id")
        .maybeSingle();
      if (error || !data)
        return privateJson(
          {
            error:
              "Only failed, reviewed jobs can be retried. Uncertain jobs require destination reconciliation.",
          },
          409,
        );
      return privateJson({ success: true });
    }
    return privateJson(
      { error: "Invalid action. Uncertain sends cannot be blindly replayed." },
      422,
    );
  } catch {
    return privateJson({ error: "Attendance queue unavailable. No success is assumed." }, 503);
  }
}
