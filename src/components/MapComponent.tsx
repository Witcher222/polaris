import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";

// Fix for default Leaflet markers in React
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

function MapController({ selectedPin }: { selectedPin: any }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPin) {
      map.flyTo([selectedPin.lat, selectedPin.lon], 6, {
        duration: 1.5
      });
    }
  }, [selectedPin, map]);
  return null;
}

export default function MapComponent({ mapLayer, locations, selectedPin, setSelectedPin }: any) {
  return (
    <MapContainer 
      center={[-70.76, 11.73]} 
      zoom={3} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      {mapLayer === "satellite" ? (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />
      ) : (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
      )}

      {locations.map((loc: any) => (
        <Marker 
          key={loc.id} 
          position={[loc.lat, loc.lon]}
          eventHandlers={{
            click: () => {
              setSelectedPin(loc);
            },
          }}
        >
        </Marker>
      ))}
      <MapController selectedPin={selectedPin} />
    </MapContainer>
  );
}
