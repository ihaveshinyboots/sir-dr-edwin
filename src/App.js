import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FaSearch } from 'react-icons/fa'; // Import search icon
import L from 'leaflet'; // Import Leaflet
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'; // Import rc-slider CSS

const App = () => {
  const [searchVal, setSearchVal] = useState('');
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [distance, setDistance] = useState(10000); // Distance in meters
  const [searchLocation, setSearchLocation] = useState(null); // Store the search location

  useEffect(() => {
    // Load the CSV file on load
    const csvPath = 'https://github.com/ihaveshinyboots/sir-dr-edwin/blob/master/public/locations.csv'; // Change this to an online path if needed
    fetch(csvPath)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          delimiter: '|', // Specify the delimiter as |
          complete: (results) => {
            setLocations(results.data);
            setFilteredLocations(results.data); // Initially, all locations are shown
            console.log('Loaded locations:', results.data);
          }
        });
      });
  }, []);

  const handleInputChange = (event) => {
    setSearchVal(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      fetchLocationData();
    }
  };

  const handleSearchClick = () => {
    fetchLocationData();
  };

  const handleSliderChange = (value) => {
    setDistance(value);
    if (searchLocation) {
      filterLocations(searchLocation, value);
    }
  };

  const fetchLocationData = async () => {
    try {
      const response = await axios.get(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${searchVal}&returnGeom=Y&getAddrDetails=Y&pageNum=1`);
      if (response.data.found > 0) {
        const result = response.data.results[0];
        const searchLocation = {
          latitude: parseFloat(result.LATITUDE),
          longitude: parseFloat(result.LONGITUDE),
          address: result.ADDRESS
        };
        setMarkers([searchLocation]);
        setSearchLocation(searchLocation);
        filterLocations(searchLocation, distance);
      } else {
        console.error('No results found');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const filterLocations = (searchLocation, distance) => {
    const searchPoint = L.latLng(searchLocation.latitude, searchLocation.longitude);
    const filtered = locations.filter(location => {
      const latitude = parseFloat(location.latitude);
      const longitude = parseFloat(location.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        console.error(`Invalid latitude or longitude for location: ${location.address}`);
        return false;
      }

      const locationPoint = L.latLng(latitude, longitude);
      const distanceToLocation = searchPoint.distanceTo(locationPoint); // Distance in meters
      return distanceToLocation <= distance;
    });
    setFilteredLocations(filtered);
  };

  // Create custom icons
  const customIconRed = L.icon({
    iconUrl: 'https://github.com/ihaveshinyboots/sir-dr-edwin/blob/master/public/marker.svg', // Path to your custom red SVG icon
    iconSize: [25, 41], // Size of the icon
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
  });

  const customIconBlue = L.icon({
    iconUrl: 'https://github.com/ihaveshinyboots/sir-dr-edwin/blob/master/public/blue-marker.svg', // Path to your custom blue SVG icon
    iconSize: [25, 41], // Size of the icon
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
  });

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          value={searchVal}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter postal code"
          className="search-input"
        />
        <FaSearch className="search-icon" onClick={handleSearchClick} />
      </div>
      <div className="slider-container">
        <label htmlFor="distance-slider">Distance: {distance} meters</label>
        <Slider
          id="distance-slider"
          min={0}
          max={10000}
          value={distance}
          onChange={handleSliderChange}
          railStyle={{ backgroundColor: '#d3d3d3' }}
          trackStyle={{ backgroundColor: '#007bff' }}
          handleStyle={{
            borderColor: '#007bff',
            height: 24,
            width: 24,
            marginLeft: -12,
            marginTop: -10,
            backgroundColor: '#fff',
          }}
          style={{ width: '100%' }} // Set the width to 100% to match the container
        />
      </div>
      <MapContainer center={[1.3521, 103.8198]} zoom={13} style={{ height: '90vh', width: '100%' }}>
        <TileLayer
          url="https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png"
          detectRetina={true}
          maxZoom={19}
          minZoom={11}
          attribution='<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
        />
        {filteredLocations.map((location, index) => {
          const latitude = parseFloat(location.latitude);
          const longitude = parseFloat(location.longitude);

          if (isNaN(latitude) || isNaN(longitude)) {
            console.error(`Invalid latitude or longitude for location: ${location.address}`);
            return null;
          }

          return (
            <Marker key={index} position={[latitude, longitude]} icon={customIconRed}>
              <Popup>
                {location.address}
              </Popup>
            </Marker>
          );
        })}
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.latitude, marker.longitude]} icon={customIconBlue}>
            <Popup>
              {marker.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default App;
