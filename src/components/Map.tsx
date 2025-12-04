import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchDevices, selectDevice } from '../slices/deviceSlice';
import { DeviceData, CoordsPair } from '../types';
import { Button } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { devices, selectedDevice } = useSelector((state: RootState) => state.devices);

    useEffect(() => {
        dispatch(fetchDevices());
    }, [dispatch]);

    const getRoutePolyline = (device: DeviceData): CoordsPair[] => {
        return [...device.previousCoords, device.curCoords];
    };

    const formatCoords = (coords: CoordsPair): [number, number] => {
        return [coords.latitude, coords.longitude];
    };

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapContainer
                center={[60.038353, 30.322507]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {devices.map((device) => (
                    <React.Fragment key={device.id}>
                        <Marker position={formatCoords(device.curCoords)}>
                            <Popup>
                                <div>
                                    <h3>Устройство {device.id}</h3>
                                    <p>Статус: {device.status}</p>
                                    <p>Последняя активность: {new Date(device.lastActivity).toLocaleString()}</p>
                                    <Button 
                                        variant="contained" 
                                        size="small"
                                        onClick={() => dispatch(selectDevice(device.id))}
                                    >
                                        Показать маршрут
                                    </Button>
                                </div>
                            </Popup>
                        </Marker>

                        {selectedDevice?.id === device.id && device.previousCoords.length > 0 && (
                            <Polyline
                                positions={getRoutePolyline(device).map(formatCoords)}
                                color="blue"
                                weight={4}
                                opacity={0.7}
                            />
                        )}
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;