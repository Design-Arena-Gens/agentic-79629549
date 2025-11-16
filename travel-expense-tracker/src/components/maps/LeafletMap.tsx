"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import type { ExpenseCategory } from "@/lib/constants";
import { CATEGORY_STYLES } from "@/lib/constants";

type ExpensePoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  amount: number;
  category: ExpenseCategory;
  timestamp: string;
};

type LeafletMapProps = {
  points: ExpensePoint[];
  currency: string;
};

const iconCache: Record<ExpenseCategory, L.DivIcon> = {} as Record<
  ExpenseCategory,
  L.DivIcon
>;

const getIcon = (category: ExpenseCategory) => {
  if (iconCache[category]) return iconCache[category];
  const colorMap: Record<ExpenseCategory, string> = {
    food: "#f97316",
    drinks: "#0ea5e9",
    shopping: "#a855f7",
    experience: "#10b981",
    counter: "#84cc16",
    travel: "#ef4444",
    "local commute": "#6366f1",
  };

  const icon = L.divIcon({
    className:
      "relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white shadow-lg",
    html: `<span style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:36px;
      height:36px;
      border-radius:50%;
      background:${colorMap[category]};
      color:white;
      font-size:16px;
      font-weight:600;
      ">
        ₹
    </span>`,
    iconAnchor: [18, 36],
    popupAnchor: [0, -24],
  });
  iconCache[category] = icon;
  return icon;
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

const LeafletMap = ({ points, currency }: LeafletMapProps) => {
  const bounds = useMemo(() => {
    if (!points.length) return undefined;
    const latLngs = points.map((point) => [point.lat, point.lng]) as [
      number,
      number,
    ][];
    return L.latLngBounds(latLngs);
  }, [points]);

  return (
    <MapContainer
      center={points[0] ? [points[0].lat, points[0].lng] : [defaultCenter.lat, defaultCenter.lng]}
      bounds={bounds}
      scrollWheelZoom={false}
      className="h-64 w-full rounded-3xl shadow-inner shadow-slate-900/10"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={getIcon(point.category)}
        >
          <Popup>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{point.label}</p>
              <p className="text-sm text-slate-600">
                {formatCurrency(point.amount, currency)}
              </p>
              <p className="text-xs text-slate-400">
                {formatDateTime(point.timestamp)}
              </p>
              <div
                className={`rounded-full px-2 py-0.5 text-xs font-medium text-white shadow ${CATEGORY_STYLES[point.category].gradient}`}
              >
                {CATEGORY_STYLES[point.category].label}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;
