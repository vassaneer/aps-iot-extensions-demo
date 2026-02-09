/// import * as Autodesk from "@types/forge-viewer";
/// import * as Chart from "@types/chart.js";

import { findNearestTimestampIndex } from "./HistoricalDataView.js";

export class GraphComplexPanel extends Autodesk.Viewing.UI.DockingPanel {
  constructor(viewer, id, title, options) {
    super(viewer.container, id, title, options);
    this.container.style.left =
      ((options === null || options === void 0 ? void 0 : options.x) || 0) +
      "px";
    this.container.style.top =
      ((options === null || options === void 0 ? void 0 : options.y) || 0) +
      "px";
    this.container.style.width =
      ((options === null || options === void 0 ? void 0 : options.width) ||
        500) + "px";
    this.container.style.height =
      ((options === null || options === void 0 ? void 0 : options.height) ||
        350) + "px";
    this.container.style.resize = "none";
    this._charts = [];
    this._lastHighlightedPointIndex = -1;
  }

  initialize() {
    this.title = this.createTitleBar(this.titleLabel || this.container.id);
    this.initializeMoveHandlers(this.title);
    this.container.appendChild(this.title);
    this.container.style.height = "350px";
    this.content = document.createElement("div");
    this.content.style.position = "relative";
    this.content.style.height = "300px";
    this.content.style.backgroundColor = "#333";
    this.content.style.opacity = 0.9;
    this.content.style.overflowY = "auto";
    this.content.style.overflowX = "hidden";
    this.container.appendChild(this.content);
  }

  updateCharts(sensorId, dataView) {
    this.content.innerHTML = "";
    this._charts = [];

    const chartHeight = 200;
    for (const [channelId, channel] of dataView.getChannelsGraph().entries()) {
      const canvas = document.createElement("canvas");
      canvas.id = `graph-complex-chart-${channelId}`;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = `${chartHeight}px`;
      canvas.style.marginBottom = "16px";

      this.content.appendChild(canvas);

      const samplesX = dataView.getSamples(sensorId, channel.varX);
      const samplesY = dataView.getSamples(sensorId, channel.varY);
      // zip X + Y + timestamp
      const combined = samplesX.timestamps.map((ts, i) => ({
        ts: +new Date(ts),
        x: samplesX.values[i],
        y: samplesY.values[i],
      }));

      // sort ตาม timestamp (เลือก asc / desc)
      combined.sort((a, b) => a.x - b.x);

      // unzip กลับ
      const sortedSamplesX = {
        timestamps: combined.map((p) => new Date(p.ts)),
        values: combined.map((p) => p.x),
      };

      const sortedSamplesY = {
        timestamps: combined.map((p) => new Date(p.ts)),
        values: combined.map((p) => p.y),
      };

      this._charts.push(
        this._createChart(
          canvas,
          sortedSamplesX?.values || [],
          sortedSamplesY?.values || [],
          channel.min,
          channel.max,
          `${channel.name} (${channel.unitX})`,
        ),
      );
    }
  }

  _createChart(canvas, timestamps, values, min, max, title) {
    const offset = 7 * 60 * 60 * 1000;
    // console.log(values);
    return new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: timestamps,
        datasets: [
          {
            label: title,
            data: values,
            radius: values.map((_) => 3),
            fill: false,
            borderColor: "#eee",
            color: "#eee",
            tension: 0.1,
          },
        ],
        options: {
          scales: {
            y: { min, max },
          },
        },
      },
    });
  }

  updateCursor(sensorId, dataView, currentTime) {
    const defaultChannelID = dataView.getChannelsGraph().keys().next().value;
    if (!defaultChannelID) {
      return;
    }
    const samples = dataView.getSamples(sensorId, defaultChannelID);
    if (!samples) {
      return;
    }
    const sampleIndex = findNearestTimestampIndex(
      samples.timestamps,
      currentTime,
    );
    if (sampleIndex !== this._lastHighlightedPointIndex) {
      for (const chart of this._charts) {
        // @ts-ignore
        const radii = chart.data.datasets[0].radius;
        for (let i = 0; i < radii.length; i++) {
          radii[i] = i === sampleIndex ? 9 : 3;
        }
        chart.update();
      }
      this._lastHighlightedPointIndex = sampleIndex;
    }
  }
}
