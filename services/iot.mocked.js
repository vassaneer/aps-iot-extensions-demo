const SENSORS = {
    'sensor-1': {
        name: 'Living Room',
        description: 'Basic sensor in the middle of the living room.',
        groupName: 'Level 1',
        location: {
            x: -40.855347447356536,
            y: -61.63255171477795,
            z: 0.05078194733289365
        },
        objectId: 2176
    },
    'sensor-2': {
        name: 'Dining Table',
        description: 'Basic sensor at the dining table.',
        groupName: 'Level 1',
        location: {
            x: -10,
            y: 41.64,
            z: -12.15
        },
        objectId: 4111
    },
    'sensor-3': {
        name: 'Kitchen',
        description: 'Basic sensor in the kitchen.',
        groupName: 'Level 1',
        location: {
            x: 10,
            y: 41.64,
            z: -12.15
        },
        objectId: 4111
    }
};

const CHANNELS = {
    'temp': {
        name: 'Temperature',
        description: 'External temperature in degrees Celsius.',
        type: 'double',
        unit: '°C',
        min: 18.0,
        max: 28.0,
        color: ['#4b0082', '#ffff00', '#ff0000']
    },
    'co2': {
        name: 'CO₂',
        description: 'Level of carbon dioxide.',
        type: 'double',
        unit: 'ppm',
        min: 482.81,
        max: 640.00,
        color: ['#0000ff', '#ffff00', '#ff0000']
    }
};

async function getSensors() {
    return SENSORS;
}

async function getChannels() {
    return CHANNELS;
}

async function getSamples(timerange, resolution = 32) {
    return {
        count: resolution,
        timestamps: generateTimestamps(timerange.start, timerange.end, resolution),
        data: {
            'sensor-1': {
                'temp': generateRandomValues(18.0, 28.0, resolution, 1.0),
                'co2': generateRandomValues(540.0, 600.0, resolution, 5.0)
            },
            'sensor-2': {
                'temp': generateRandomValues(20.0, 24.0, resolution, 1.0),
                'co2': generateRandomValues(540.0, 600.0, resolution, 5.0)
            },
            'sensor-3': {
                'temp': generateRandomValues(24.0, 28.0, resolution, 1.0),
                'co2': generateRandomValues(500.0, 620.0, resolution, 5.0)
            },
            'sensor-4': {
                'temp': generateRandomValues(20.0, 24.0, resolution, 1.0),
                'co2': generateRandomValues(600.0, 640.0, resolution, 5.0)
            }
        }
    };
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
    getSamples
};
