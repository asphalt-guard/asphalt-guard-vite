import SideNavigation from "../components/SideNavigation";
import { useNavigate } from "react-router-dom";

function AIModels() {
    const navigate = useNavigate();
    const models = [
        {
            id: "model-01",
            name: "Road Defect Detector v1",
            modelType: "YOLOv8m",
            dateTrained: "2026-03-14",
            f1Score: 0.92,
            description:
                "Balanced model for crack and pothole detection across urban roads.",
            confusionMatrix: [
                [84, 7],
                [5, 91],
            ],
            workingImage:
                "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=900&q=80",
            futureInfo: "4h 12m",
        },
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <div className="flex h-screen overflow-hidden font-sans bg-gray-50 flex-col p-5">
            {/* Header */}
            <div
                className="flex justify-between items-center p-5 rounded-lg shadow-md border border-[#e0e0e0] bg-white"
                style={{ margin: "0 10px 10px 10px" }}
            >
                <div className="flex gap-2.5">
                    <img
                        src="/asphaltguard-favicon.svg"
                        alt="AsphaltGuard logo"
                        className="h-6 w-6"
                    />
                    <p>AsphaltGuard</p>
                </div>
                <p>AI Models</p>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 gap-5 min-h-0">
                {/* Navigation Sidebar */}
                <div style={{ margin: "10px", minWidth: "fit-content" }}>
                    <SideNavigation
                        onNavigate={handleNavigation}
                        activePath="models"
                    />
                </div>

                {/* Main Content */}
                <div
                    className="flex-1 min-h-0 bg-white rounded-lg shadow-md border border-[#e0e0e0] p-5 overflow-hidden"
                    style={{ margin: "10px" }}
                >
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Model Dashboard
                            </h2>
                            <span className="text-sm text-gray-500">
                                {models.length} models
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
                            {models.map((model) => (
                                <div
                                    key={model.id}
                                    className="border border-gray-200 rounded-2xl bg-linear-to-b from-white to-gray-50 overflow-hidden"
                                >
                                    <div className="border-b border-gray-200 px-5 py-4">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {model.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 grid grid-cols-1 xl:grid-cols-12 gap-5">
                                        <div className="xl:col-span-5">
                                            <div className="bg-white border border-gray-200 rounded-xl p-3 h-full">
                                                <img
                                                    src={model.workingImage}
                                                    alt={`${model.name} preview`}
                                                    className="w-full h-56 object-cover rounded-lg"
                                                />
                                                <p className="text-xs text-gray-500 mt-3 px-1">
                                                    Model working preview image
                                                </p>
                                                <p className="text-sm text-gray-600 mt-2 px-1">
                                                    {model.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="xl:col-span-7 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="bg-white border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                                        Model Type
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800 mt-1">
                                                        {model.modelType}
                                                    </p>
                                                </div>
                                                <div className="bg-white border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                                        Date Trained
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800 mt-1">
                                                        {model.dateTrained}
                                                    </p>
                                                </div>
                                                <div className="bg-white border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                                        Time Training
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800 mt-1">
                                                        {model.futureInfo}
                                                    </p>
                                                </div>
                                                <div className="bg-white border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                                        Status
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800 mt-1">
                                                        Ready for deployment
                                                        review
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-3">
                                                <div className="bg-white border border-gray-200 rounded-xl p-4 md:w-1/2">
                                                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                                                        Confusion Matrix
                                                    </p>
                                                    <div className="grid grid-cols-2 grid-rows-2 gap-3 h-32 w-full">
                                                        {model.confusionMatrix.map(
                                                            (row, rowIndex) =>
                                                                row.map(
                                                                    (
                                                                        value,
                                                                        colIndex,
                                                                    ) => (
                                                                        <div
                                                                            key={`${model.id}-${rowIndex}-${colIndex}`}
                                                                            className="h-full w-full flex items-center justify-center rounded-lg bg-gray-100 text-base font-semibold text-gray-700"
                                                                        >
                                                                            {
                                                                                value
                                                                            }
                                                                        </div>
                                                                    ),
                                                                ),
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="md:w-1/2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col justify-center">
                                                    <p className="text-xs uppercase tracking-wide text-emerald-700">
                                                        F1 Score
                                                    </p>
                                                    <p className="text-4xl font-bold text-emerald-700 mt-1">
                                                        {model.f1Score.toFixed(
                                                            2,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-emerald-700/80 mt-2">
                                                        Highlighted performance
                                                        metric
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIModels;
