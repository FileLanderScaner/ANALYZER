"use client";
import React, { useState } from "react";

export default function CveSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(query)}&resultsPerPage=5`);
      const data = await res.json();
      setResults(data.vulnerabilities || []);
    } catch (err) {
      setError("No se pudo buscar vulnerabilidades. Intenta de nuevo más tarde.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Buscador de Vulnerabilidades (CVE)</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-2 py-1"
          placeholder="Ej: WordPress, Apache, CVE-2024-xxxx, etc."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="bg-primary text-background px-4 py-1 rounded">Buscar</button>
      </form>
      {loading && <div>Buscando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="space-y-4">
        {results.map((item: any, idx) => (
          <li key={idx} className="border rounded p-3 bg-card">
            <div className="font-semibold">{item.cve.id}</div>
            <div className="text-sm text-muted-foreground">{item.cve.descriptions?.[0]?.value}</div>
            <a href={`https://nvd.nist.gov/vuln/detail/${item.cve.id}`} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">Ver detalles</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
