const INFERNO_STOPS: [number, number, number][] = [
    [0, 0, 4],
    [10, 7, 34],
    [31, 12, 72],
    [60, 9, 101],
    [89, 0, 110],
    [120, 14, 106],
    [148, 33, 97],
    [174, 53, 84],
    [197, 76, 68],
    [216, 100, 50],
    [231, 127, 33],
    [241, 158, 16],
    [245, 191, 10],
    [242, 225, 37],
    [252, 255, 164],
];

const TEMP_MIN = 0;
const TEMP_MAX = 100;

function inferno(t: number): string {
    const clamped = Math.max(0, Math.min(1, t));
    const pos = clamped * (INFERNO_STOPS.length - 1);
    const i = Math.min(Math.floor(pos), INFERNO_STOPS.length - 2);
    const f = pos - i;
    const a = INFERNO_STOPS[i],
        b = INFERNO_STOPS[i + 1];
    const r = Math.round(a[0] + (b[0] - a[0]) * f);
    const g = Math.round(a[1] + (b[1] - a[1]) * f);
    const bl = Math.round(a[2] + (b[2] - a[2]) * f);
    return `rgb(${r},${g},${bl})`;
}

export default function ThermalGrid({ grid }: { grid: number[][] }) {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;

    return (
        <div
            className="w-full"
            style={{
                display: "grid",
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                aspectRatio: `${cols} / ${rows}`,
            }}
        >
            {grid.flatMap((row, r) =>
                row.map((val, c) => (
                    <div
                        key={`${r}-${c}`}
                        title={`${val.toFixed(1)}°C`}
                        style={{
                            backgroundColor: inferno(
                                Math.max(
                                    0,
                                    Math.min(
                                        1,
                                        (val - TEMP_MIN) /
                                            (TEMP_MAX - TEMP_MIN),
                                    ),
                                ),
                            ),
                        }}
                    />
                )),
            )}
        </div>
    );
}
