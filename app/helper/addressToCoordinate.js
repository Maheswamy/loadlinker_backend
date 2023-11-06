const axios = require("axios");

const addressPicker = async (fulladdress) => {
  const { address, area, district, state, country, pin } = fulladdress;
  return await addressToCoordinate(
    `${area},${district},${state},${country},${pin}`
  );
};

const addressToCoordinate = async (address) => {
  const query = new URLSearchParams({
    q: `${address}`,
    locale: "en",
    limit: "1",
    reverse: "false",
    debug: "false",
    point: "",
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
        vehicle: "truck",
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
    return { distance: data.paths[0].distance/1000, time: data.paths[0].time/1000 };
  } catch (error) {
    return error.message;
  }
};

module.exports = { addressToCoordinate, calculateDistance, addressPicker };
