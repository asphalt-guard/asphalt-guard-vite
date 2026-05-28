import { useEffect, useState } from "react";
import DashboardShell from "./DashboardShell";
import HistoryCaptureDetail from "../components/HistoryCaptureDetail";
import HistoryCaptureList from "../components/HistoryCaptureList";
import {
    CAPTURE_LIST_SELECT,
    type CaptureRow,
} from "../lib/captureUtils";
import { supabase } from "../lib/supabase";

function History() {
    const [captures, setCaptures] = useState<CaptureRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCapture, setSelectedCapture] = useState<CaptureRow | null>(
        null,
    );
    const [detailVisible, setDetailVisible] = useState(false);

    useEffect(() => {
        const loadCaptures = async () => {
            setLoading(true);
            const { data } = await supabase
                .from("captures")
                .select(CAPTURE_LIST_SELECT)
                .eq("gps_valid", true)
                .order("captured_at", { ascending: false });
            setCaptures((data as CaptureRow[]) ?? []);
            setLoading(false);
        };
        loadCaptures();
    }, []);

    const openCaptureDetail = (cap: CaptureRow) => {
        setSelectedCapture(cap);
        requestAnimationFrame(() => setDetailVisible(true));
    };

    const closeCaptureDetail = () => {
        setDetailVisible(false);
        setTimeout(() => setSelectedCapture(null), 200);
    };

    return (
        <DashboardShell
            title="History"
            activePath="history"
            loading={loading}
            contentClassName="flex min-h-0 flex-col !p-4 md:!p-6"
        >
            <div
                className={`mx-auto flex w-full min-h-0 flex-1 flex-col ${
                    selectedCapture
                        ? "max-w-5xl lg:max-w-6xl"
                        : "max-w-2xl lg:max-w-3xl"
                }`}
            >
                {selectedCapture ? (
                    <div
                        className={`min-h-0 flex-1 transition-opacity duration-200 ease-in-out ${
                            detailVisible
                                ? "opacity-100"
                                : "opacity-0 pointer-events-none"
                        }`}
                    >
                        <HistoryCaptureDetail
                            capture={selectedCapture}
                            onClose={closeCaptureDetail}
                        />
                    </div>
                ) : (
                    <HistoryCaptureList
                        captures={captures}
                        onSelect={openCaptureDetail}
                    />
                )}
            </div>
        </DashboardShell>
    );
}

export default History;
