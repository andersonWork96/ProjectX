"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapUser {
  id: number;
  name: string;
  username: string;
  isCreator: boolean;
  city: string | null;
  latitude: number;
  longitude: number;
}

export default function AdminMap({ users }: { users: MapUser[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const center: [number, number] = users.length > 0
      ? [users[0].latitude, users[0].longitude]
      : [-14.235, -51.925];

    const map = L.map(mapRef.current, {
      center,
      zoom: 4,
      maxZoom: 13,
      minZoom: 3,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png").addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Limpar markers antigos
    map.eachLayer(layer => {
      if (layer instanceof L.CircleMarker) map.removeLayer(layer);
    });

    // Jitter para não empilhar
    const jitter = (id: number, base: number) => {
      const seed = Math.sin(id * 9301 + 49297) % 1;
      return base + seed * 0.008;
    };

    users.forEach(u => {
      const marker = L.circleMarker(
        [jitter(u.id, u.latitude), jitter(u.id + 999, u.longitude)],
        {
          radius: 6,
          fillColor: u.isCreator ? "#a855f7" : "#6366f1",
          fillOpacity: 0.8,
          color: "#fff",
          weight: 1.5,
          opacity: 0.6,
        }
      );

      marker.bindPopup(
        `<div style="color:#000;font-size:11px;line-height:1.4">
          <strong>${u.name}</strong><br/>
          @${u.username}<br/>
          ${u.isCreator ? "🟣 Criador" : "🔵 Usuário"}<br/>
          ${u.city || "Sem cidade"}
        </div>`
      );

      marker.addTo(map);
    });
  }, [users]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
