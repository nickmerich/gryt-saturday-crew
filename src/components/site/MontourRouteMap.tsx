import { useState } from "react";
import { useRun } from "@/lib/run-context";
import { RUN_LOCATION } from "@/lib/run-occurrence";

const OPTIONS = [3, 4, 6.2];
export function MontourRouteMap() {
  const run = useRun();
  const [distance, setDistance] = useState(4);
  const standardLocation = run.location === RUN_LOCATION;
  return (
    <section id="route" className="gryt-utility-section" aria-labelledby="route-title">
      <div className="gryt-utility-inner">
        <p className="eyebrow eyebrow-blue">Know where to go</p>
        <h2 id="route-title" className="gryt-utility-title">
          {run.route}
        </h2>
        <p className="gryt-utility-intro">
          Meet at {run.location}. Check with the run lead before setting off.
        </p>
        {standardLocation ? (
          <div className="gryt-utility-panel">
            <h3 className="text-xl font-semibold">Out-and-back distance planner</h3>
            <p className="mt-2 text-paper/75">
              Choose a target distance to see the halfway point. This is planning math, not a
              verified trail marker or navigation route.
            </p>
            <div
              role="group"
              aria-label="Plan a round-trip distance"
              className="flex flex-wrap gap-3 mt-5"
            >
              {OPTIONS.map((value) => (
                <button
                  key={value}
                  className={distance === value ? "btn-primary" : "btn-ghost"}
                  aria-pressed={distance === value}
                  onClick={() => setDistance(value)}
                >
                  {value} miles
                </button>
              ))}
            </div>
            <p className="mt-5 text-lg" aria-live="polite">
              For {distance} miles total, turn around at approximately{" "}
              <strong>{distance / 2} miles out</strong>.
            </p>
            <p className="mt-3 text-sm text-paper/70">
              Turn around sooner if you need to. Confirm the route and turnaround with the
              organizer.
            </p>
          </div>
        ) : (
          <div className="gryt-utility-panel">
            The meeting point has changed. The usual route planner is hidden until the organizer
            confirms the new route.
          </div>
        )}
        <div className="gryt-utility-panel mt-4">
          <h3 className="text-xl font-semibold">Meeting point and directions</h3>
          <p className="mt-2">{run.location}</p>
          <a
            className="btn-primary mt-5"
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(run.location)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open address directions
          </a>
          <p className="mt-4 text-sm text-paper/70">
            A verified route line, exact parking pin and elevation profile are not available yet. We
            are not displaying the unverified map or estimated climb as navigation.
          </p>
        </div>
      </div>
    </section>
  );
}
