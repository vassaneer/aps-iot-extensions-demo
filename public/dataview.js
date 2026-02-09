export class MyDataView {
  constructor() {
    this._timerange = [new Date(), new Date()];
    this._timestamps = [];
    this._sensors = new Map();
    this._channels = new Map();
    this._channelsGraph = new Map();
    this._data = null;
    this._floor = null;
    this._sensorsFilteredByFloor = null;
    this._constant = null;
  }

  async _fetch(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const json = await resp.json();
    return json;
  }

  async _post(url, data) {
    const resp = await fetch(url, {
      method: "post",
      body: JSON.stringify(data),
      headers: new Headers({ "Content-Type": "application/json" }),
    });
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const json = await resp.json();
    return json;
  }

  async _delete(url) {
    const resp = await fetch(url, {
      method: "delete",
    });

    if (!resp.ok) {
      throw new Error(await resp.text());
    }
  }

  async _loadSensors() {
    this._sensors.clear();
    const json = await this._fetch("/iot/sensors");
    for (const [sensorId, sensor] of Object.entries(json)) {
      this._sensors.set(sensorId, sensor);
    }
    this._sensorsFilteredByFloor = null;
  }

  async _loadChannels() {
    this._channels.clear();
    const json = await this._fetch("/iot/channels");
    for (const [channelId, channel] of Object.entries(json)) {
      this._channels.set(channelId, channel);
    }
  }

  async _loadChannelsGraph() {
    this._channels.clear();
    const json = await this._fetch("/iot/channels/graph");
    for (const [channelId, channel] of Object.entries(json)) {
      this._channelsGraph.set(channelId, channel);
    }
  }

  async _loadConstant() {
    this._sensors.clear();
    const json = await this._fetch("/iot/constants");
    this._constant = json;
  }

  normalizeDate(value, fallback) {
    if (value instanceof Date && !isNaN(value)) {
      return value;
    }

    if (typeof value === "string") {
      const d = new Date(value);
      if (!isNaN(d)) {
        return d;
      }
    }

    return fallback;
  }

  async _loadSamples(timerange, resolution) {
    var { start, end } = timerange;
    start = this.normalizeDate(
      start,
      this._timerange[0] ?? new Date(Date.now() - 5 * 60 * 1000),
    );

    end = this.normalizeDate(end, this._timerange[1] ?? new Date());

    if (start != null) {
      this._timerange[0] = start;
    }
    if (end != null) {
      this._timerange[1] = end;
    }
    const { timestamps, data } = await this._fetch(
      `/iot/samples?start=${start.toISOString()}&end=${end.toISOString()}&resolution=${resolution}`,
    );
    this._timestamps = timestamps.map((str) => new Date(str));
    this._data = data;

    const constants = await this._fetch(`/iot/constants`);
    // check deflection >= L/240 * 0.9
    Object.entries(data).forEach(([sensorId, sensorData]) => {
      const deflection = sensorData.deflection;
      const stress = sensorData.stress;

      if (
        !Array.isArray(deflection) ||
        deflection.length === 0 ||
        !Array.isArray(stress) ||
        stress.length === 0 ||
        constants.L <= 0
      )
        return;

      const lastDeflection = deflection[deflection.length - 1];
      const thresholdD = (constants.L / 240) * 0.9;
      if (lastDeflection >= (constants.L / 240) * 0.9) {
        alert(
          `⚠️ ALERT\nSensor: ${sensorId}\nThreshold = ${thresholdD} \nLast deflection = ${lastDeflection}`,
        );
      }

      const lastStress = stress[stress.length - 1];
      const thresholdS = 2300;
      if (lastStress >= thresholdS) {
        alert(
          `⚠️ ALERT\nSensor: ${sensorId}\nThreshold = ${thresholdS}\nLast stress = ${lastStress}`,
        );
      }
    });

    // check stress <= 2300
  }

  async init(timerange, resolution = 32) {
    try {
      await Promise.all([
        this._loadSensors(),
        this._loadChannels(),
        this._loadChannelsGraph(),
        this._loadConstant(),
        this._loadSamples(timerange, resolution),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  async refresh(timerange, resolution = 32) {
    try {
      await this._loadSamples(timerange, resolution);
    } catch (err) {
      console.error(err);
    }
  }

  get floor() {
    return this._floor;
  }

  set floor(floor) {
    this._floor = floor;
    this._sensorsFilteredByFloor = null;
  }

  getSensors() {
    if (!this._sensorsFilteredByFloor) {
      this._sensorsFilteredByFloor = new Map();
      for (const [sensorId, sensor] of this._sensors.entries()) {
        if (
          !this._floor ||
          (sensor.location.z >= this._floor.zMin &&
            sensor.location.z <= this._floor.zMax)
        ) {
          this._sensorsFilteredByFloor.set(sensorId, sensor);
        }
      }
    }
    return this._sensorsFilteredByFloor;
  }

  getChannels() {
    return this._channels;
  }

  getChannelsGraph() {
    return this._channelsGraph;
  }

  getTimerange() {
    return this._timerange;
  }

  getSamples(sensorId, channelId) {
    if (!this._data[sensorId] || !this._data[sensorId][channelId]) {
      return null;
    }
    return {
      count: this._timestamps.length,
      timestamps: this._timestamps,
      values: this._data[sensorId][channelId],
    };
  }

  startAutoRefresh(intervalMs = 5000, resolution = 32) {
    // กันซ้อน
    this.stopAutoRefresh();

    this._refreshIntervalId = setInterval(async () => {
      try {
        console.log(this._timerange);
        await this.refresh(this._timerange, resolution);
      } catch (err) {
        console.error("Auto refresh failed:", err);
      }
    }, intervalMs);
  }

  stopAutoRefresh() {
    if (this._refreshIntervalId) {
      clearInterval(this._refreshIntervalId);
      this._refreshIntervalId = null;
    }
  }
}
