import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for missing marker icon issue in some setups
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function HospitalMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hospital } = location.state || {};

  useEffect(() => {
    if (!hospital) {
      navigate("/nearby-hospitals"); // Redirect back if no hospital data
    }
  }, [hospital, navigate]);

  if (!hospital || !hospital.latitude || !hospital.longitude) {
    return <p className="text-center mt-10 text-red-500">No hospital location data available.</p>;
  }

  return (
    <div className="h-[90vh] w-full">
      <MapContainer
        center={[hospital.latitude, hospital.longitude]}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[hospital.latitude, hospital.longitude]}>
          <Popup>
            <strong>{hospital.name}</strong><br />
            {hospital.address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default HospitalMap;
