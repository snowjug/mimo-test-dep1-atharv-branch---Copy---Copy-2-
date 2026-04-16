import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export function PrintHistory() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/print-history`, {
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
              <p><strong>File:</strong> {job.documentName}</p>
              <p><strong>Status:</strong> {job.status}</p>
              <p><strong>Date:</strong> {new Date(job.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}