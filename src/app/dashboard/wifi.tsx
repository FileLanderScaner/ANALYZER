// Extiende el tipo Navigator para soportar 'connection'
declare global {
  interface Navigator {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  }
}

"use client";
import React, { useEffect, useState } from "react";

export default function WifiSecurity() {
  const [wifiInfo, setWifiInfo] = useState<any>(null);

  useEffect(() => {
    // Solo se puede obtener información limitada desde el navegador
    if (navigator.connection) {
      setWifiInfo({
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
      });
    } else {
      setWifiInfo({ error: "No se puede acceder a la información de la red desde este navegador." });
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Revisión de Seguridad WiFi</h1>
      {wifiInfo ? (
        wifiInfo.error ? (
          <div className="text-red-500">{wifiInfo.error}</div>
        ) : (
          <div className="space-y-2">
            <div><b>Tipo de conexión:</b> {wifiInfo.effectiveType}</div>
            <div><b>Velocidad estimada:</b> {wifiInfo.downlink} Mbps</div>
            <div><b>Latencia estimada:</b> {wifiInfo.rtt} ms</div>
            <div><b>Modo ahorro de datos:</b> {wifiInfo.saveData ? "Sí" : "No"}</div>
            <div className="mt-4 text-yellow-500">
              {wifiInfo.effectiveType === "4g"
                ? "Tu conexión parece rápida y moderna."
                : "Advertencia: Tu conexión podría ser lenta o menos segura. Considera usar una red WiFi segura y cifrada."}
            </div>
          </div>
        )
      ) : (
        <div>Cargando información de la red...</div>
      )}
    </div>
  );
}
