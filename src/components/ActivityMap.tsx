import React from "react";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Polyline } from "react-leaflet";
import { type ActivityProps } from "~/types";

type Props = {
  activity: ActivityProps;
  zoom?: number;
};

export default function ActivityMap({ activity, zoom = 12 }: Props) {
  const { start_latlng, summary_polyline: polylines } = activity;

  const polyData = polyline.decode(polylines);
  const bounds = L.latLngBounds(polyData);

  const pointerIcon = new L.Icon({
    iconUrl:
      "https://icons.iconarchive.com/icons/paomedia/small-n-flat/512/map-marker-icon.png",
    iconAnchor: [15, 20],
    iconSize: [30, 30],
  });

  return (
    <MapContainer
      boxZoom={false}
      bounds={bounds}
      dragging={false}
      zoomControl={false}
      scrollWheelZoom={false}
      className=" h-96 w-full opacity-100"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline positions={polyData} color="blue" />
      <Marker position={start_latlng} icon={pointerIcon} />
    </MapContainer>
  );
}
