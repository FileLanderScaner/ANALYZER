"use client";
import React, { useState } from "react";

export default function WebScan() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Llamada real al backend
      const res = await fetch("/api/webscan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError("No se pudo analizar el sitio. Intenta de nuevo más tarde.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Escaneo de Vulnerabilidades Web</h1>
      <form onSubmit={handleScan} className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-2 py-1"
          placeholder="https://tusitio.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
        <button type="submit" className="bg-primary text-background px-4 py-1 rounded" disabled={loading}>Escanear</button>
      </form>
      {loading && <div>Analizando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {result && (
        <div className="mt-4 border rounded bg-card p-4">
          <div className="font-semibold mb-2">Resultado para: {result.url}</div>
          <div className="mb-2">Puntaje de seguridad: <b>{result.score}/100</b></div>
          <ul className="list-disc pl-5 space-y-1">
            {result.issues.map((issue: any, idx: number) => (
              <li key={idx}><b>{issue.type}:</b> {issue.description}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
