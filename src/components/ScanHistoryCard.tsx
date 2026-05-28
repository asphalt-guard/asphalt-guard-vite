import { Thermometer } from "lucide-react";

type ScanRecord = {
    id: string | number;
    created_at: string;
    annotated_img_url?: string | null;
    thermal_img_url?: string | null;
    pothole_count?: number | null;
    max_temp?: number | null;
};

interface ScanHistoryCardProps {
    scan: ScanRecord;
}

function ScanHistoryCard({ scan }: ScanHistoryCardProps) {
    const date = new Date(scan.created_at).toLocaleDateString();
    const time = new Date(scan.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    const potholeCount = scan.pothole_count ?? 0;
    const maxTemp = typeof scan.max_temp === "number" ? scan.max_temp : null;
    const hasThermal = Boolean(scan.thermal_img_url);

    return (
        <div className="flex cursor-pointer items-center justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-gray-700/50">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex shrink-0 gap-2">
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-800">
                        {scan.annotated_img_url ? (
                            <img
                                src={scan.annotated_img_url}
                                alt="Annotated scan preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-gray-500">
                                No image
                            </div>
                        )}
                    </div>
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-800">
                        {hasThermal ? (
                            <img
                                src={scan.thermal_img_url ?? ""}
                                alt="Thermal scan preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-gray-500">
                                No thermal
                            </div>
                        )}
                        <span className="absolute bottom-1 left-1 right-1 rounded bg-black/55 px-1 text-center text-[9px] font-semibold tracking-wide text-white">
                            THERMAL
                        </span>
                    </div>
                </div>

                <div className="flex min-w-0 flex-col">
                    <p className="truncate text-sm font-medium text-white">
                        {potholeCount}{" "}
                        {potholeCount === 1 ? "Pothole" : "Potholes"} detected
                    </p>
                    <p
                        className={`mt-0.5 inline-flex items-center gap-1 text-xs font-medium ${
                            maxTemp !== null
                                ? "text-orange-300"
                                : "text-gray-500"
                        }`}
                    >
                        <Thermometer size={12} aria-hidden />
                        <span>
                            Max temp:{" "}
                            {maxTemp !== null ? `${maxTemp}°C` : "—"}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500">
                        Scan ID: #{scan.id.toString().slice(-4)}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 flex-col items-end text-sm text-gray-400">
                <p className="font-medium text-gray-300">{time}</p>
                <p>{date}</p>
            </div>
        </div>
    );
}

export default ScanHistoryCard;
