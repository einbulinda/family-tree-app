import React, { useState, useEffect } from "react";
import { getLogger } from "../utils/logger";

const DebugLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [filterLevel, setFilterLevel] = useState("ALL");

  const levelClasses: Record<string, string> = {
    ERROR: "bg-red-100 text-red-800",
    WARN: "bg-yellow-100 text-yellow-800",
    DEBUG: "bg-gray-100 text-gray-800",
  };

  const logger = getLogger();

  useEffect(() => {
    const updateLogs = () => {
      const allLogs = logger.getLogs();
      let filteredLogs = allLogs;

      if (filterLevel !== "ALL") {
        filteredLogs = allLogs.filter((log) => log.level === filterLevel);
      }

      setLogs(filteredLogs);
    };

    // Update logs every second
    const interval = setInterval(updateLogs, 1000);
    updateLogs(); // Initial load

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLevel]);

  const exportLogs = () => {
    const logText = logger.exportLogs();
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `family-tree-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    logger.clearLogs();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full z-50"
      >
        🐞
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex flex-col">
      <div className="p-2 bg-gray-100 border-b flex justify-between items-center">
        <div className="flex space-x-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="text-sm border rounded px-1"
          >
            <option value="ALL">All</option>
            <option value="DEBUG">Debug</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warn</option>
            <option value="ERROR">Error</option>
          </select>
          <button
            onClick={exportLogs}
            className="text-xs bg-green-600 text-white px-2 py-1 rounded"
          >
            Export
          </button>
          <button
            onClick={clearLogs}
            className="text-xs bg-red-600 text-white px-2 py-1 rounded"
          >
            Clear
          </button>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
        >
          Hide
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 text-xs font-mono">
        {logs.slice(-50).map((log, index) => (
          <div
            key={`${log.timestamp}-${log.level}-${log.message}-${index}`}
            className={`mb-1 p-1 rounded ${
              levelClasses[log.level] ?? "bg-blue-100 text-blue-800"
            }`}
          >
            <span className="text-gray-500">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className="ml-2 font-bold">[{log.level}]</span>
            <span className="ml-2">{log.message}</span>
            {log.context && (
              <pre className="mt-1 text-xs bg-white p-1 rounded">
                {JSON.stringify(log.context, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugLogs;
