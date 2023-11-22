const axios = require("axios");

const addressPicker = async (fulladdress) => {
  const { address, area, district, state, country, pin, lat, lng } =
    fulladdress;
  return await addressToCoordinate(
    `${area},${district},${state},${country},${pin}`,
    lat,
    lng
  );
};

const addressToCoordinate = async (address, lat , lng ) => {
  console.log(address, lat, lng);
  const query = new URLSearchParams({
    q: lat && lng ? "" : `${address}`,
    locale: "en",
    limit: "1",
    reverse: lat && lng ? "true" : "false",
    debug: "false",
    point: lat && lng ? `${lat},${lng}` : "",
    provider: "default",
    key: process.env.GRAPHHOPPER_API_KEY,
  }).toString();

  try {
    const response = await axios.get(
      `https://graphhopper.com/api/1/geocode?${query}`
    );
    return Object.values(response.data.hits[0].point).reverse();
  } catch (e) {
    return e.message;
  }
};

const calculateDistance = async (coordinates) => {
  console.log(coordinates,'coordinates')
  const query = new URLSearchParams({
    key: process.env.GRAPHHOPPER_API_KEY,
  }).toString();

  try {
    const resp = await axios.post(
      `https://graphhopper.com/api/1/route?${query}`,
      {
        points: coordinates,
        snap_preventions: ["motorway", "ferry", "tunnel"],
        details: ["road_class", "surface"],
        vehicle: "bike",
        locale: "en",
        instructions: true,
        calc_points: true,
        points_encoded: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = resp.data;
    return {
      distance: data.paths[0].distance / 1000,
      time: data.paths[0].time / 1000,
    };
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

module.exports = { addressToCoordinate, calculateDistance, addressPicker };
