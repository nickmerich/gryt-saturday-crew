// Local browser fixture only. Not imported by application routes or production builds.
import { createRoot } from "react-dom/client";
import { OrganizerAttendance } from "../../src/components/site/OrganizerAttendance";
import "../../src/styles.css";
if (!["127.0.0.1", "localhost"].includes(location.hostname)) throw new Error("Local fixture only");
createRoot(document.getElementById("root")!).render(
  <OrganizerAttendance
    initialDate="2026-09-19"
    transport={(date, command) =>
      fetch(`/__organizer_fixture?date=${date}`, {
        method: command ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: command ? JSON.stringify(command) : undefined,
      })
    }
  />,
);
