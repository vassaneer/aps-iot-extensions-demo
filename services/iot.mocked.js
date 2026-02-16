const {
  DATA_API_TOKEN,
  DATA_API_ENDPOINT,
  DATA_API_ENDPOINT_2,
} = require("../config.js");

let CONSTANTS = {
  L: null,
  S: null,
  E: null,
  C: null,
};

const SENSORS = {
  "sensor-1": {
    name: "Sensor 1",
    description: "Basic sensor in the middle of the living room.",
    groupName: "Level 1",
    location: {
      x: 0,
      y: -2.05,
      z: 2.656,
    },
    objectId: 5418,
  },
  "sensor-2": {
    name: "Sensor 2",
    description: "Basic sensor in the middle of the living room.",
    groupName: "Level 1",
    location: {
      x: 1.6,
      y: -2.05,
      z: 2.656,
    },
    objectId: 5418,
  },
  "sensor-3": {
    name: "Sensor 3",
    description: "Basic sensor in the middle of the living room.",
    groupName: "Level 1",
    location: {
      x: -1.6,
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
    min: -7.5,
    max: 7.5,
    precision: 2,
    color: [
      "#FF0000",
      "#FF6A00",
      "#FFA500",
      "#FFFF00",
      "#33FF00",
      "#33FFCC",
      "#33CCFF",
      "#5B9BFF",
    ],
  },
  stress: {
    name: "Stress",
    description: "Measure Stress",
    type: "double",
    unit: "ksc",
    min: -2400,
    max: 2400,
    precision: 7,
    color: [
      "#FF0000",
      "#FF6A00",
      "#FFA500",
      "#FFFF00",
      "#33FF00",
      "#33FFCC",
      "#33CCFF",
      "#5B9BFF",
    ],
  },
  strain: {
    name: "Strain",
    description: "Measure Strain",
    type: "double",
    unit: "ε",
    min: -0.0009,
    max: 0.0009,
    precision: 2,
    color: [
      "#FF0000",
      "#FF6A00",
      "#FFA500",
      "#FFFF00",
      "#33FF00",
      "#33FFCC",
      "#33CCFF",
      "#5B9BFF",
    ],
  },
  weight: {
    name: "Weight",
    description: "Measure Weight",
    type: "double",
    unit: "kg/m",
    min: 0,
    max: 500,
    precision: 2,
    color: [
      "#FF0000",
      "#FF6A00",
      "#FFA500",
      "#FFFF00",
      "#33FF00",
      "#33FFCC",
      "#33CCFF",
      "#5B9BFF",
    ],
  },
};

const CHANNELS_GRAPH = {
  stressStrain: {
    name: "Stress VS Strain",
    description: "Compare Stress and Strain",
    type: "double",
    unitX: "kg/cm2",
    unitY: "ε",
    varX: "stress",
    varY: "strain",
  },
  weightDeflection: {
    name: "Weight VS Deflection",
    description: "Compare Weight and Deflection",
    type: "double",
    unitX: "kg/m",
    unitY: "mm",
    varX: "weight",
    varY: "deflection",
  },
};

function getConstants() {
  return CONSTANTS;
}

function setConstants(newValues) {
  CONSTANTS = {
    ...CONSTANTS,
    ...newValues,
  };
  return CONSTANTS;
}

async function getSensors() {
  return SENSORS;
}

async function getChannels() {
  return CHANNELS;
}

async function getChannelsGraph() {
  return CHANNELS_GRAPH;
}

function calData(data) {
  var timestamps = [];
  var deflection = [];
  var stress = [];
  var strain = [];
  var weight = [];
  if (data && Object.keys(data).length > 0) {
    // Check if the object has any own properties
    // get timestamp

    if (data.hasOwnProperty("deflection_mm")) {
      data.deflection_mm.forEach((item, index) => {
        timestamps.unshift(new Date(item.ts));
        var def = parseFloat(item.value);
        deflection.unshift(def);
        var constant = getConstants();
        var omega = null;
        var w = null;
        if (constant.C != null && constant.L != null && constant.L != 0) {
          omega =
            (def * 384 * constant.C * 10) /
            (40 * constant.L * constant.L * 100);
          stress.unshift(omega);
        }
        if (
          constant.E != null &&
          constant.S != null &&
          constant.L != null &&
          constant.L != 0 &&
          omega != null
        ) {
          w =
            (8 * constant.E * omega * constant.S * 100) /
            (constant.L * constant.L);
          weight.unshift(w);
        }
        if (
          constant.L != null &&
          constant.S != null &&
          constant.S != 0 &&
          w != null
        ) {
          const st = (w * constant.L * constant.L) / 100 / 8 / constant.S;
          strain.unshift(st);
        }
      });
    }
  }
  // get all data sensors
  return {
    timestamps,
    deflection,
    stress,
    strain,
    weight,
  };
}

async function getSamples(timerange, resolution = 32) {
  // fetch data from
  const startEpoch = new Date(timerange.start).getTime() - 7 * 60 * 60 * 1000;
  const endEpoch = new Date(timerange.end).getTime() - 7 * 60 * 60 * 1000;

  try {
    // const resp = await fetch(
    //   DATA_API_ENDPOINT + "&startTs=" + startEpoch + "&endTs=" + endEpoch,
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: "Bearer " + DATA_API_TOKEN,
    //     },
    //   },
    // );
    // const resp2 = await fetch(
    //   DATA_API_ENDPOINT_2 + "&startTs=" + startEpoch + "&endTs=" + endEpoch,
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: "Bearer " + DATA_API_TOKEN,
    //     },
    //   },
    // );
    // const da = await resp.json();
    // const da2 = await resp2.json();
    const da = { deflection_mm: [{ value: 2.66 }] };
    const da2 = { deflection_mm: [{ value: 2.66 }] };
    data1 = calData(da);
    data2 = calData(da2);
    const count =
      data1.timestamps.length > data2.timestamps.length
        ? data1.timestamps.length
        : data2.timestamps.length;
    const time =
      data1.timestamps.length > data2.timestamps.length
        ? data1.timestamps
        : data2.timestamps;
    return {
      count: count,
      timestamps: time,
      data: {
        "sensor-1": {
          deflection: data1.deflection,
          stress: data1.stress,
          strain: data1.strain,
          weight: data1.weight,
        },
        "sensor-2": {
          deflection: data2.deflection,
          stress: data2.stress,
          strain: data2.strain,
          weight: data2.weight,
        },
        "sensor-3": {
          deflection: data2.deflection,
          stress: data2.stress,
          strain: data2.strain,
          weight: data2.weight,
        },
      },
    };
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
  getChannelsGraph,
  getSamples,
  getConstants,
  setConstants,
};
