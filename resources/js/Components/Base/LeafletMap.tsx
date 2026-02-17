import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icon in Leaflet with webpack/vite
import iconRouter from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconRouter,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
    latitude: number;
    longitude: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ position, onLocationSelect }: { position: [number, number], onLocationSelect: (lat: number, lng: number) => void }) {
    const map = useMapEvents({
        click(e: L.LeafletMouseEvent) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [position, map]);

    return position === null ? null : (
        <Marker 
            position={position} 
            draggable={true}
            eventHandlers={{
                dragend: (e: L.LeafletEvent) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    onLocationSelect(position.lat, position.lng);
                },
            }}
        />
    );
}

export default function LeafletMap({ latitude, longitude, onLocationSelect }: LeafletMapProps) {
    // Default to Indonesia center if 0,0 provided
    const defaultPosition: [number, number] = [latitude || -2.5489, longitude || 118.0149];
    const zoomLevel = latitude && longitude ? 15 : 5;

    return (
        <div className="h-full min-h-[400px] w-full rounded-sm overflow-hidden border border-slate-200 shadow-sm z-0">
            <MapContainer 
                center={defaultPosition} 
                zoom={zoomLevel} 
                scrollWheelZoom={true} 
                className="h-full w-full"
                style={{ height: '100%', minHeight: '400px' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                    position={[latitude || 0, longitude || 0]} 
                    onLocationSelect={onLocationSelect} 
                />
            </MapContainer>
        </div>
    );
}
