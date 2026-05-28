import DashboardShell from "./DashboardShell";

function AIModels() {
    const models = [
        {
            id: "model-placeholder",
            name: "AsphaltGuard Model v2",
            modelType: "TBD",
            dateTrained: "—",
            f1Score: 0,
            description: "Placeholder for the next training run.",
            confusionMatrix: [
                [0, 0],
                [0, 0],
            ],
            trainingTime: "—",
            status: "Queued for training",
        },
        {
            id: "model-01",
            name: "AsphaltGuard Model v1",
            modelType: "YOLOv26n",
            dateTrained: "February 18, 2026",
            f1Score: 0.81,
            description: "First model trained on the pothole dataset.",
            confusionMatrix: [
                [84, 7],
                [5, 91],
            ],
            trainingTime: "4h 12m",
            status: "Ready for deployment review",
        },
    ];

    return (
        <DashboardShell title="AI Models" activePath="models">
            <div className="flex flex-col gap-4">
                <p className="text-xs text-gray-500">
                    {models.length} {models.length === 1 ? "model" : "models"}
                </p>

                {models.map((model) => (
                    <div
                        key={model.id}
                        className="flex flex-col gap-3 rounded-xl border border-gray-700/50 bg-gray-800/70 p-4 shadow-lg"
                    >
                        <p className="text-sm font-medium text-white">
                            {model.name}
                        </p>
                        <p className="text-xs text-gray-400">
                            {model.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-gray-800/70 p-2">
                                <p className="text-[10px] uppercase text-gray-500">
                                    Model Type
                                </p>
                                <p className="text-sm font-medium text-white">
                                    {model.modelType}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gray-800/70 p-2">
                                <p className="text-[10px] uppercase text-gray-500">
                                    Date Trained
                                </p>
                                <p className="text-sm font-medium text-white">
                                    {model.dateTrained}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gray-800/70 p-2">
                                <p className="text-[10px] uppercase text-gray-500">
                                    Training Time
                                </p>
                                <p className="text-sm font-medium text-white">
                                    {model.trainingTime}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gray-800/70 p-2">
                                <p className="text-[10px] uppercase text-gray-500">
                                    Status
                                </p>
                                <p className="text-sm font-medium text-white">
                                    {model.status}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-emerald-800/30 bg-emerald-950/50 p-3">
                            <p className="text-xs uppercase text-emerald-400">
                                F1 Score
                            </p>
                            <p className="text-2xl font-bold text-emerald-300">
                                {model.f1Score.toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-800/70 p-3">
                            <p className="mb-2 text-[10px] uppercase text-gray-500">
                                Confusion Matrix
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {model.confusionMatrix.flat().map((value, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-center rounded-lg bg-gray-700/50 py-3"
                                    >
                                        <span className="text-sm font-semibold text-white">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardShell>
    );
}

export default AIModels;
