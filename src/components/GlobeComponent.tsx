import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export default function GlobeComponent({ locations, selectedPin, onSelectPin }: any) {
  const globeEl = useRef<any>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
      globeEl.current.pointOfView({ lat: -70, lng: 0, altitude: 2 }, 1000);
    }
  }, []);

  useEffect(() => {
    if (selectedPin && globeEl.current) {
      globeEl.current.pointOfView({ lat: selectedPin.lat, lng: selectedPin.lon, altitude: 0.15 }, 1500);
      globeEl.current.controls().autoRotate = false;
    } else if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
    }
  }, [selectedPin]);

  const markerData = locations.map((loc: any) => ({
    lat: loc.lat,
    lng: loc.lon,
    size: loc.type === 'Research Base' ? 1.5 : loc.type === 'Expedition' ? 1 : 0.5,
    color: loc.type === 'Research Base' ? '#0d9488' : loc.type === 'Expedition' ? '#f59e0b' : '#3b82f6',
    ...loc
  }));

  return (
    <div className="absolute inset-0 cursor-move">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        width={windowWidth}
        height={windowHeight}
        labelsData={markerData}
        labelLat={(d: any) => d.lat}
        labelLng={(d: any) => d.lng}
        labelText={(d: any) => d.name}
        labelSize={(d: any) => d.size}
        labelDotRadius={(d: any) => d.size * 0.5}
        labelColor={(d: any) => d.color}
        labelResolution={2}
        onLabelClick={(d: any) => onSelectPin(d)}
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
      />
    </div>
  );
}
