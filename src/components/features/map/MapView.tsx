"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import Map, { Source, Layer, type MapRef, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { GeoJSONSource, CircleLayerSpecification } from "maplibre-gl";
import { BuildingPopup } from "./BuildingPopup";
import { useMapFilterStore } from "@/lib/stores/map-filter-store";
import { useSelectionStore } from "@/lib/stores/selection-store";
import { buildingsToFeatureCollection } from "@/lib/map/buildings-to-geojson";
import { getArchitectHex as getArchitectHexColor } from "@/lib/architect-colors";
import type { Building, Architect } from "@/types";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

interface MapViewProps {
  buildings: Building[];
  architects: Architect[];
}

export function MapView({ buildings, architects }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupBuilding, setPopupBuilding] = useState<Building | null>(null);
  const [cursor, setCursor] = useState("");
  const selectedCityIds = useMapFilterStore((s) => s.selectedCityIds);
  const selectedTagSlugs = useMapFilterStore((s) => s.selectedTagSlugs);
  const highlightedArchitectId = useMapFilterStore((s) => s.highlightedArchitectId);
  const selectedBuildingIds = useSelectionStore((s) => s.selectedBuildingIds);

  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      const cityMatch =
        selectedCityIds.length === 0 || selectedCityIds.includes(b.cityId);
      const tagMatch =
        selectedTagSlugs.length === 0 ||
        b.tags.some((t) => selectedTagSlugs.includes(t.slug));
      return cityMatch && tagMatch;
    });
  }, [buildings, selectedCityIds, selectedTagSlugs]);

  // When architect is highlighted, show only their buildings
  const displayBuildings = useMemo(() => {
    if (!highlightedArchitectId) return filteredBuildings;
    return filteredBuildings.filter(
      (b) => b.architectId === highlightedArchitectId,
    );
  }, [filteredBuildings, highlightedArchitectId]);

  const geojsonData = useMemo(
    () => buildingsToFeatureCollection(displayBuildings),
    [displayBuildings],
  );

  const getArchitect = useCallback(
    (architectId: string) => architects.find((a) => a.id === architectId),
    [architects],
  );

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const features = e.features;
      if (!features?.length) return;

      const feature = features[0];
      const props = feature.properties;

      // Cluster click → zoom in
      if (props?.cluster) {
        const source = mapRef.current?.getSource("buildings") as GeoJSONSource | undefined;
        if (!source) return;

        source.getClusterExpansionZoom(props.cluster_id).then((zoom) => {
          mapRef.current?.flyTo({
            center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
            zoom,
            duration: 500,
          });
        });
        return;
      }

      // Individual point click → popup
      const buildingId = props?.id;
      const building = buildings.find((b) => b.id === buildingId);
      if (!building) return;

      setPopupBuilding(building);
      mapRef.current?.flyTo({
        center: [building.location.lng, building.location.lat],
        zoom: 12,
        duration: 800,
      });
    },
    [buildings],
  );

  const handleMouseEnter = useCallback(() => setCursor("pointer"), []);
  const handleMouseLeave = useCallback(() => setCursor(""), []);

  // Paint expressions — selection state
  const unclusteredPaint = useMemo((): CircleLayerSpecification["paint"] => {
    const paint: Record<string, unknown> = {
      "circle-color": ["get", "architectColor"],
      "circle-radius": highlightedArchitectId ? 7 : 5,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    };

    if (selectedBuildingIds.length > 0 && !highlightedArchitectId) {
      paint["circle-radius"] = [
        "case",
        ["in", ["get", "id"], ["literal", selectedBuildingIds]],
        7,
        5,
      ];
      paint["circle-stroke-width"] = [
        "case",
        ["in", ["get", "id"], ["literal", selectedBuildingIds]],
        3,
        2,
      ];
    }

    return paint as CircleLayerSpecification["paint"];
  }, [selectedBuildingIds, highlightedArchitectId]);

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
      interactiveLayerIds={["clusters", "unclustered-point"]}
      onClick={handleMapClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      cursor={cursor}
    >
      <Source
        id="buildings"
        type="geojson"
        data={geojsonData}
        cluster={true}
        clusterRadius={50}
        clusterMaxZoom={14}
      >
        {/* Cluster circles */}
        <Layer
          id="clusters"
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": highlightedArchitectId
              ? (getArchitectHexColor(highlightedArchitectId))
              : "#666666",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              15,
              10, 20,
              30, 25,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          }}
        />

        {/* Cluster count labels */}
        <Layer
          id="cluster-count"
          type="symbol"
          filter={["has", "point_count"]}
          layout={{
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 11,
          }}
          paint={{
            "text-color": "#ffffff",
          }}
        />

        {/* Individual building points */}
        <Layer
          id="unclustered-point"
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={unclusteredPaint}
        />
      </Source>

      {popupBuilding ? (
        <BuildingPopup
          building={popupBuilding}
          architect={getArchitect(popupBuilding.architectId)}
          onClose={() => setPopupBuilding(null)}
        />
      ) : null}
    </Map>
  );
}
