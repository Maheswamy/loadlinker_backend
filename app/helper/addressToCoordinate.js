const axios = require("axios");

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
    return response.data;
  } catch (e) {
    return e;
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
    console.log(data, "mhaneghj");
    return data;
  } catch (error) {
    return error;
  }
};

module.exports = { addressToCoordinate, calculateDistance };
