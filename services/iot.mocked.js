const { DATA_API_TOKEN, DATA_API_ENDPOINT } = require("../config.js");

const SENSORS = {
  "sensor-1": {
    name: "Living Room",
    description: "Basic sensor in the middle of the living room.",
    groupName: "Level 1",
    location: {
      x: 0,
      y: -2.05,
      z: 2.656,
    },
    objectId: 5418,
  },
};

const CHANNELS = {
  deflection: {
    name: "Deflection",
    description: "Measure deflection in millimeter",
    type: "double",
    unit: "mm",
    min: -100,
    max: 0.0,
    color: ["#ff0000", "#ffff00", "#4b0082"],
  },
};

async function getSensors() {
  return SENSORS;
}

async function getChannels() {
  return CHANNELS;
}

async function getSamples(timerange, resolution = 32) {
  // fetch data from
  const startEpoch = new Date(timerange.start).getTime() - 7 * 60 * 60 * 1000;
  const endEpoch = new Date(timerange.end).getTime() - 7 * 60 * 60 * 1000;

  try {
    const resp = await fetch(
      DATA_API_ENDPOINT + "&startTs=" + startEpoch + "&endTs=" + endEpoch,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + DATA_API_TOKEN,
        },
      },
    );
    const data = await resp.json();
    if (data && Object.keys(data).length > 0) {
      // Check if the object has any own properties
      // get timestamp
      var timestamps = [];
      var deflection = [];
      if (data.hasOwnProperty("deflection_mm")) {
        data.deflection_mm.forEach((item, index) => {
          timestamps.unshift(new Date(item.ts));
          deflection.unshift(parseFloat(item.value));
        });
      }

      return {
        count: timestamps.length,
        timestamps: timestamps,
        data: {
          "sensor-1": {
            deflection: deflection,
            // co2: generateRandomValues(540.0, 600.0, resolution, 5.0),
          },
        },
      };
    }
  } catch (err) {
    console.error(err);
  }
}

function generateTimestamps(start, end, count) {
  const delta = Math.floor((end.getTime() - start.getTime()) / (count - 1));
  const timestamps = [];
  for (let i = 0; i < count; i++) {
    timestamps.push(new Date(start.getTime() + i * delta));
  }
  return timestamps;
}

function generateRandomValues(min, max, count, maxDelta) {
  const values = [];
  let lastValue = min + Math.random() * (max - min);
  for (let i = 0; i < count; i++) {
    values.push(lastValue);
    lastValue += (Math.random() - 0.5) * 2.0 * maxDelta;
    if (lastValue > max) {
      lastValue = max;
    }
    if (lastValue < min) {
      lastValue = min;
    }
  }
  return values;
}

module.exports = {
  getSensors,
  getChannels,
  getSamples,
};
