import type { CaptureRow } from "../lib/captureUtils";
import {
    formatPhilippineDateTime,
    getCaptureTitleByTime,
    getConditionFromMaxTemp,
    getRcCarTempC,
} from "../lib/captureUtils";

type HistoryCaptureListProps = {
    captures: CaptureRow[];
    onSelect: (capture: CaptureRow) => void;
};

export default function HistoryCaptureList({
    captures,
    onSelect,
}: HistoryCaptureListProps) {
    if (captures.length === 0) {
        return (
            <p className="text-sm text-gray-400">
                No captures with GPS data found.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {captures.map((cap) => {
                const temp = getRcCarTempC(cap);
                const { label: conditionLabel, color: conditionColor } =
                    getConditionFromMaxTemp(temp);

                return (
                    <button
                        key={cap.id}
                        type="button"
                        onClick={() => onSelect(cap)}
                        className="w-full cursor-pointer rounded-lg bg-gray-800/70 p-3 text-left transition-colors hover:bg-gray-700/70"
                    >
                        <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium text-white">
                                {getCaptureTitleByTime(cap.captured_at)}
                            </p>
                            <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white ${conditionColor}`}
                            >
                                {conditionLabel}
                            </span>
                        </div>
                        <div className="flex min-w-0 items-center justify-between gap-2 text-xs text-gray-400">
                            <span className="shrink-0">
                                {temp !== null ? `${temp.toFixed(1)}°C` : "—"}
                            </span>
                            <span className="truncate text-right">
                                {formatPhilippineDateTime(cap.captured_at)}
                            </span>
                        </div>
                        <p className="mt-1 truncate text-[10px] text-gray-500">
                            {cap.gps_latitude.toFixed(6)},{" "}
                            {cap.gps_longitude.toFixed(6)}
                        </p>
                    </button>
                );
            })}
        </div>
    );
}
