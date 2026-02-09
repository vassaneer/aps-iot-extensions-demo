/// import * as Autodesk from "@types/forge-viewer";

import { UIBaseExtension } from "./BaseExtension.js";
import { ConstantPanel } from "./ConstantPanel.js";

export const ConstantExtensionID = "IoT.Constant";

export class ConstantExtension extends UIBaseExtension {
  constructor(viewer, options) {
    super(viewer, options);
  }

  // onDataViewChanged(oldDataView, newDataView) {
  //   this.update(true);
  // }

  // onCurrentTimeChanged(oldTime, newTime) {
  //   this.update(false);
  // }

  // update(updateColumns) {
  //   if (this.dataView && this.currentTime && this.panel) {
  //     this.panel.update(this.dataView, this.currentTime, updateColumns);
  //   }
  // }

  async load() {
    await super.load();
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/tabulator-tables@5.1.7/dist/js/tabulator.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    await new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://unpkg.com/tabulator-tables@5.1.7/dist/css/tabulator_midnight.min.css";
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
    this.panel = new ConstantPanel(
      this.viewer,
      "constant-entity",
      "Constant",
      {},
    );
    // console.log(this.panel.table);
    this.panel.onSensorClicked = (sensorId) => {
      if (this.onSensorClicked) {
        this.onSensorClicked(sensorId);
      }
    };
    console.log(`${ConstantExtensionID} extension loaded.`);
    return true;
  }

  unload() {
    super.unload();
    this.panel?.uninitialize();
    this.panel = undefined;
    console.log(`${SensorListExtensionID} extension unloaded.`);
    return true;
  }

  activate() {
    super.activate();
    this.panel?.setVisible(true);
    requestAnimationFrame(() => {
      if (this.panel?.table && this.dataView?._constant) {
        this.panel.updateConstants(this.dataView._constant);
      }
    });

    return true;
  }

  deactivate() {
    super.deactivate();
    this.panel?.setVisible(false);
    return true;
  }

  onToolbarCreated() {
    this.createToolbarButton(
      "constant-entity-btn",
      "Constant Entity",
      "https://img.icons8.com/?size=100&id=8186&format=png&color=000000",
    ); // <a href="https://icons8.com/icon/qTpBZcesrDao/reminders">Reminders icon by Icons8</a>
  }
}
