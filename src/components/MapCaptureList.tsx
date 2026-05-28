import type { CaptureRow } from "../lib/captureUtils";
import {
    formatPhilippineDateTime,
    getCaptureTitleByTime,
    getConditionFromMaxTemp,
} from "../lib/captureUtils";

type MapCaptureListProps = {
    captures: CaptureRow[];
    onSelect: (capture: CaptureRow) => void;
};

export default function MapCaptureList({
    captures,
    onSelect,
}: MapCaptureListProps) {
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
                const temp = cap.thermal_max_c;
                const { label: conditionLabel, color: conditionColor } =
                    getConditionFromMaxTemp(temp);

                return (
                    <button
                        key={cap.id}
                        type="button"
                        onClick={() => onSelect(cap)}
                        className="cursor-pointer rounded-lg bg-gray-800/70 p-3 text-left transition-colors hover:bg-gray-700/70"
                    >
                        <div className="mb-1 flex items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                {getCaptureTitleByTime(cap.captured_at)}
                            </p>
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white ${conditionColor}`}
                            >
                                {conditionLabel}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{temp !== null ? `${temp}°C` : "—"}</span>
                            <span>
                                {formatPhilippineDateTime(cap.captured_at)}
                            </span>
                        </div>
                        <p className="mt-1 text-[10px] text-gray-500">
                            {cap.gps_latitude.toFixed(6)},{" "}
                            {cap.gps_longitude.toFixed(6)}
                        </p>
                    </button>
                );
            })}
        </div>
    );
}
