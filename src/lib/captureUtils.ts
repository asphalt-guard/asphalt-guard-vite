export type CaptureRow = {
    id: number;
    gps_latitude: number;
    gps_longitude: number;
    thermal_mean_c: number | null;
    thermal_grid: number[][] | null;
    image_url: string | null;
    yolo_crack: boolean | null;
    yolo_pothole: boolean | null;
    rccar_temperature_c: number | null;
    captured_at: string;
};

export const CAPTURE_LIST_SELECT =
    "id, gps_latitude, gps_longitude, thermal_mean_c, thermal_grid, image_url, yolo_crack, yolo_pothole, rccar_temperature_c, captured_at";

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

export function getDroneTempC(capture: CaptureRow): number | null {
    return capture.thermal_mean_c;
}

export function getRcCarTempC(capture: CaptureRow): number | null {
    return capture.rccar_temperature_c;
}

export type RccarLiveData = {
    temperature_c: number | null;
    valid: boolean | null;
    connected: boolean | null;
    error_code: number | null;
    error_message: string | null;
};

export type ThermalLiveData = {
    grid: number[][];
    mean_c: number | null;
};

export function parseThermalRawResponse(data: unknown): ThermalLiveData | null {
    if (!data || typeof data !== "object") return null;
    const row = data as Record<string, unknown>;
    if (row.error) return null;

    const mean_c =
        typeof row.mean_c === "number"
            ? row.mean_c
            : typeof row.mean === "number"
              ? row.mean
              : null;

    const toGrid = (temps: unknown): number[][] | null => {
        if (!Array.isArray(temps) || temps.length === 0) return null;
        if (Array.isArray(temps[0])) {
            return temps as number[][];
        }
        const width =
            typeof row.width === "number" ? row.width : null;
        const height =
            typeof row.height === "number" ? row.height : null;
        if (width && height && temps.length >= width * height) {
            const flat = temps as number[];
            return Array.from({ length: height }, (_, r) =>
                flat.slice(r * width, (r + 1) * width),
            );
        }
        return null;
    };

    const grid =
        toGrid(row.temperatures) ??
        toGrid(row.thermal_grid) ??
        null;

    if (!grid || grid.length === 0 || (grid[0]?.length ?? 0) === 0) {
        return null;
    }

    return { grid, mean_c };
}

export function parseRccarLiveResponse(data: unknown): RccarLiveData | null {
    if (!data || typeof data !== "object") return null;
    const row = data as Record<string, unknown>;
    if (row.error) return null;

    const pickNumber = (...keys: string[]): number | null => {
        for (const key of keys) {
            const value = row[key];
            if (typeof value === "number" && !Number.isNaN(value)) {
                return value;
            }
        }
        return null;
    };

    const pickBoolean = (...keys: string[]): boolean | null => {
        for (const key of keys) {
            const value = row[key];
            if (typeof value === "boolean") return value;
        }
        return null;
    };

    const pickString = (...keys: string[]): string | null => {
        for (const key of keys) {
            const value = row[key];
            if (typeof value === "string" && value.length > 0) return value;
        }
        return null;
    };

    return {
        temperature_c: pickNumber(
            "rccar_temperature_c",
            "temperature_c",
            "temp_c",
            "temp",
        ),
        valid: pickBoolean("rccar_valid", "valid"),
        connected: pickBoolean("rccar_connected", "connected"),
        error_code: pickNumber("rccar_error_code", "error_code"),
        error_message: pickString("rccar_error_message", "error_message"),
    };
}
