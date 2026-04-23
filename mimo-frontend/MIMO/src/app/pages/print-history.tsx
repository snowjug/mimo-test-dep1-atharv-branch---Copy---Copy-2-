import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export function PrintHistory() {
  const [history, setHistory] = useState<any[]>([]);

  const formatDate = (job: any) => {
    const millis = job.createdAtMs ?? job.dateMs ?? job.createdAt ?? job.date;
    if (millis === null || millis === undefined) return "N/A";

    const parsed = typeof millis === "number" ? millis : Date.parse(millis);
    return Number.isNaN(parsed) ? "N/A" : new Date(parsed).toLocaleString();
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await apiFetch("/print-history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Print History</h1>

      {history.length === 0 ? (
        <p>No print history found</p>
      ) : (
        <div className="space-y-3">
          {history.map((job) => (
            <div key={job._id} className="p-4 border rounded-lg bg-white">
              <p><strong>Code:</strong> {job.printCode}</p>
              <p><strong>File:</strong> {job.documentName || job.file}</p>
              <p><strong>Status:</strong> {job.status}</p>
              <p><strong>Date:</strong> {formatDate(job)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}