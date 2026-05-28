export type CaptureRow = {
    id: number;
    gps_latitude: number;
    gps_longitude: number;
    thermal_max_c: number | null;
    thermal_min_c: number | null;
    thermal_mean_c: number | null;
    thermal_ambient_c: number | null;
    thermal_grid: number[][] | null;
    image_url: string | null;
    yolo_crack: boolean | null;
    yolo_pothole: boolean | null;
    captured_at: string;
};

export const CAPTURE_LIST_SELECT =
    "id, gps_latitude, gps_longitude, thermal_max_c, thermal_min_c, thermal_mean_c, thermal_ambient_c, thermal_grid, image_url, yolo_crack, yolo_pothole, captured_at";

const PH_TIMEZONE = "Asia/Manila";

export function formatPhilippineDateTime(isoDate: string): string {
    return new Date(isoDate).toLocaleString([], {
        timeZone: PH_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function getCaptureTitleByTime(isoDate: string): string {
    const hour = Number(
        new Intl.DateTimeFormat("en-US", {
            timeZone: PH_TIMEZONE,
            hour: "2-digit",
            hour12: false,
        }).format(new Date(isoDate)),
    );

    if (Number.isNaN(hour)) return "Road Capture";
    if (hour >= 5 && hour < 12) return "Morning Capture";
    if (hour >= 12 && hour < 17) return "Afternoon Capture";
    if (hour >= 17 && hour < 21) return "Evening Capture";
    return "Night Capture";
}

export function getConditionFromMaxTemp(temp: number | null): {
    label: string;
    color: string;
} {
    if (temp === null) return { label: "Unknown", color: "bg-gray-600" };
    if (temp <= 50) return { label: "Good", color: "bg-emerald-500" };
    if (temp <= 60) return { label: "Fair", color: "bg-yellow-500" };
    if (temp <= 70) return { label: "Deteriorating", color: "bg-orange-500" };
    return { label: "Critical", color: "bg-red-500" };
}

export function getRcCarTempC(capture: CaptureRow): number | null {
    const { thermal_max_c, thermal_min_c, thermal_mean_c } = capture;
    if (
        thermal_max_c === null ||
        thermal_min_c === null ||
        thermal_mean_c === null
    ) {
        return null;
    }
    return (thermal_max_c + thermal_min_c + thermal_mean_c) / 3;
}
