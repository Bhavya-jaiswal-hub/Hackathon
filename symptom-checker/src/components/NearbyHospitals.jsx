import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function NearbyHospitals() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const latitude = parseFloat(searchParams.get("lat"));
  const longitude = parseFloat(searchParams.get("lng"));

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!latitude || !longitude) {
      setError("Location not provided. Please go back and try again.");
      setLoading(false);
      return;
    }

    const fetchHospitals = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/hospitals/nearby`,
          {
            params: { latitude, longitude },
          }
        );

        setHospitals(response.data.hospitals || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch nearby hospitals. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [latitude, longitude]);

  const handleHospitalClick = (hospital) => {
    navigate("/hospital-map", { state: { hospital } });
  };

  if (loading) return <p className="text-center mt-10">Loading nearby hospitals...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  if (hospitals.length === 0) {
    return <p className="text-center mt-10">No hospitals found near your location.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        Nearby Hospitals
      </h2>

    <ul>
  {hospitals.map((hospital, index) => (
    <li
      key={hospital.id || index}
      className="border p-4 mb-4 rounded-md cursor-pointer hover:bg-blue-50"
      onClick={() => handleHospitalClick(hospital)}
    >
      <h3 className="font-semibold text-lg">{hospital.name}</h3>
      <p className="text-gray-600">{hospital.address}</p>
    </li>
  ))}
</ul>

    </div>
  );
}

export default NearbyHospitals;
