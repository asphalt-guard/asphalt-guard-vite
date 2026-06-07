import { Car, Drone } from "lucide-react";
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
                const { label: conditionLabel, color: conditionColor } =
                    getConditionFromMaxTemp(cap.thermal_ambient_c);

                return (
                    <button
                        key={cap.id}
                        type="button"
                        onClick={() => onSelect(cap)}
                        className="cursor-pointer rounded-lg bg-gray-800/70 p-3 text-left transition-colors hover:bg-gray-700/70"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                {getCaptureTitleByTime(cap.captured_at)}
                            </p>
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white ${conditionColor}`}
                            >
                                {conditionLabel}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg border border-gray-700/50 bg-gray-800/70 p-2">
                                <div className="mb-1 flex items-center gap-1.5">
                                    <Drone
                                        size={14}
                                        className="text-gray-400"
                                        aria-hidden
                                    />
                                    <p className="text-[10px] font-medium uppercase text-gray-400">
                                        Drone
                                    </p>
                                </div>
                                <p className="text-[10px] uppercase text-gray-500">
                                    Temp Data
                                </p>
                                <p className="text-base font-bold text-white">
                                    {cap.thermal_ambient_c !== null
                                        ? `${cap.thermal_ambient_c.toFixed(1)}°C`
                                        : "—"}
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-700/50 bg-gray-800/70 p-2">
                                <div className="mb-1 flex items-center gap-1.5">
                                    <Car
                                        size={14}
                                        className="text-gray-400"
                                        aria-hidden
                                    />
                                    <p className="text-[10px] font-medium uppercase text-gray-400">
                                        RC Car
                                    </p>
                                </div>
                                <p className="text-[10px] uppercase text-gray-500">
                                    Temp Data
                                </p>
                                <p className="text-base font-bold text-white">
                                    {cap.rccar_temperature_c !== null
                                        ? `${cap.rccar_temperature_c.toFixed(1)}°C`
                                        : "—"}
                                </p>
                            </div>
                        </div>
                        <p className="mt-2 text-right text-xs text-gray-400">
                            {formatPhilippineDateTime(cap.captured_at)}
                        </p>
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
