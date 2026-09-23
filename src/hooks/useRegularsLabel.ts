import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAttendanceStats } from "@/lib/attendance.functions";
import { REGULARS_LABEL } from "@/lib/club-stats";

/**
 * Saturday regulars, counted from confirmed check-ins rather than a hardcoded
 * figure. Falls back to the stated baseline until there are at least two
 * finished runs with check-ins, so the homepage never shows a thin number.
 */
export function useRegularsLabel(): string {
  const fetchAttendance = useServerFn(getAttendanceStats);
  const { data } = useQuery({
    queryKey: ["gryt-attendance-stats"],
    queryFn: () => fetchAttendance(),
    staleTime: 30 * 60 * 1000,
  });

  if (!data) return REGULARS_LABEL;
  if (data.regularsRunsCounted < 2 || data.regulars < 1) return REGULARS_LABEL;
  return String(data.regulars);
}
