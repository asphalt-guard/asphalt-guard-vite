import { Car, ChevronLeft } from "lucide-react";
import type { CaptureRow } from "../lib/captureUtils";
import {
    formatPhilippineDateTime,
    getRcCarTempC,
} from "../lib/captureUtils";
import ThermalGrid from "./ThermalGrid";

type MapCaptureDetailProps = {
    capture: CaptureRow;
    onClose: () => void;
};

export default function MapCaptureDetail({
    capture,
    onClose,
}: MapCaptureDetailProps) {
    const rcCarTempC = getRcCarTempC(capture);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-lg p-1 transition-colors hover:bg-gray-800"
                >
                    <ChevronLeft size={20} className="text-gray-400" />
                </button>
                <h2 className="text-lg font-semibold text-white">Capture</h2>
            </div>

            {capture.image_url && (
                <div className="overflow-hidden rounded-xl">
                    <img
                        src={capture.image_url}
                        alt={`Capture #${capture.id}`}
                        className="h-auto w-full object-cover"
                    />
                </div>
            )}

            {capture.thermal_grid && (
                <div>
                    <p className="mb-2 text-xs uppercase text-gray-500">
                        Thermal View
                    </p>
                    <div className="overflow-hidden rounded-xl">
                        <ThermalGrid grid={capture.thermal_grid} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-red-800/30 bg-red-950/50 p-2">
                    <p className="text-[10px] uppercase text-red-400">Max Temp</p>
                    <p className="text-sm font-bold text-red-300">
                        {capture.thermal_max_c !== null
                            ? `${capture.thermal_max_c}°C`
                            : "—"}
                    </p>
                </div>
                <div className="rounded-lg border border-blue-800/30 bg-blue-950/50 p-2">
                    <p className="text-[10px] uppercase text-blue-400">Min Temp</p>
                    <p className="text-sm font-bold text-blue-300">
                        {capture.thermal_min_c !== null
                            ? `${capture.thermal_min_c}°C`
                            : "—"}
                    </p>
                </div>
                <div className="rounded-lg border border-amber-800/30 bg-amber-950/50 p-2">
                    <p className="text-[10px] uppercase text-amber-400">
                        Mean Temp
                    </p>
                    <p className="text-sm font-bold text-amber-300">
                        {capture.thermal_mean_c !== null
                            ? `${capture.thermal_mean_c}°C`
                            : "—"}
                    </p>
                </div>
            </div>

            <div className="rounded-lg border border-gray-700/50 bg-gray-800/70 p-3">
                <div className="mb-1 flex items-center gap-1.5">
                    <Car size={12} className="text-gray-400" aria-hidden />
                    <p className="text-[10px] uppercase text-gray-400">
                        RC Car Temp
                    </p>
                </div>
                <p className="text-lg font-bold text-white">
                    {rcCarTempC !== null ? `${rcCarTempC.toFixed(1)}°C` : "—"}
                </p>
            </div>

            <div className="space-y-1 rounded-lg bg-gray-800/70 p-3">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Captured</span>
                    <span className="text-gray-300">
                        {formatPhilippineDateTime(capture.captured_at)}
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Coordinates</span>
                    <span className="text-gray-300">
                        {capture.gps_latitude.toFixed(6)},{" "}
                        {capture.gps_longitude.toFixed(6)}
                    </span>
                </div>
            </div>
        </div>
    );
}
