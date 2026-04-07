"use client";

import { useState, useCallback, useRef } from "react";
import Map, { type MapRef } from "react-map-gl/maplibre";
import { BuildingMarker } from "./building-marker";
import { BuildingPopup } from "./building-popup";
import type { Building, Architect } from "@/types";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

interface MapViewProps {
  buildings: Building[];
  architects: Architect[];
}

export function MapView({ buildings, architects }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupBuilding, setPopupBuilding] = useState<Building | null>(null);

  const getArchitect = useCallback(
    (architectId: string) => architects.find((a) => a.id === architectId),
    [architects]
  );

  const handleMarkerClick = useCallback((building: Building) => {
    setPopupBuilding(building);
    mapRef.current?.flyTo({
      center: [building.location.lng, building.location.lat],
      zoom: 12,
      duration: 800,
    });
  }, []);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: 10,
        latitude: 30,
        zoom: 2,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
      attributionControl={false}
    >
      {buildings.map((building) => (
        <BuildingMarker
          key={building.id}
          building={building}
          onClick={handleMarkerClick}
        />
      ))}

      {popupBuilding && (
        <BuildingPopup
          building={popupBuilding}
          architect={getArchitect(popupBuilding.architectId)}
          onClose={() => setPopupBuilding(null)}
        />
      )}
    </Map>
  );
}
