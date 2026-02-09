/// import * as Autodesk from "@types/forge-viewer";

import { findNearestTimestampIndex } from "./HistoricalDataView.js";

export class ConstantPanel extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(viewer, id, title, options) {
    super(viewer.container, id, title, options);
    this.container.style.left = (options.x || 0) + "px";
    this.container.style.top = (options.y || 0) + "px";
    this.container.style.width = (options.width || 500) + "px";
    this.container.style.height = (options.height || 400) + "px";
    this.container.style.resize = "none";
  }

  initialize() {
    this.title = this.createTitleBar(this.titleLabel || this.container.id);
    this.initializeMoveHandlers(this.title);
    this.container.appendChild(this.title);
    this.content = document.createElement("div");
    this.content.style.height = "350px";
    this.content.style.backgroundColor = "white";
    this.content.innerHTML = `<div class="constant-container" style="position: relative; height: 350px;"></div>`;
    this.container.appendChild(this.content);
    this.table = new window.Tabulator(".constant-container", {
      index: "name",
      height: "100%",
      layout: "fitColumns",
      groupBy: "group",
      columns: [
        { title: "Name", field: "name" },
        {
          title: "Detail",
          field: "detail",
          width: 300,
        },
        { title: "Unit", field: "unit" },
        { title: "Value", field: "value", editor: "input" },
      ],
      data: [
        // L
        {
          name: "L",
          detail: "ความยาวคาน",
          unit: "cm",
          value: "",
        },

        // S
        {
          name: "S",
          detail: "Section Modulus",
          unit: "cm³",
          value: "",
        },

        // E
        {
          name: "E",
          detail: "Elastic Modulus",
          unit: "kg/cm²",
          value: "",
        },

        // C
        {
          name: "C",
          detail: "ระยะจากจุดศูนย์กลางถึงใยล่างสุดของหน้าตัด",
          unit: "cm",
          value: "",
        },
      ],
    });

    this.table.on("cellEdited", (cell) => {
      // ดึงข้อมูลทั้ง table
      const rows = this.table.getData();

      const constants = {};
      rows.forEach((row) => {
        if (row.name && row.value !== "" && row.value != null) {
          constants[row.name] = Number(row.value);
        }
      });

      // POST ไป server
      fetch("/iot/constants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(constants),
      })
        .then((res) => res.json())
        .then((result) => {
          // console.log("Constants saved:", result.constants);
        })
        .catch((err) => {
          // console.error("Failed to save constants", err);
        });
    });
  }

  updateConstants(constants) {
    if (!this.table || !constants) return;

    const rows = Object.entries(constants).map(([name, value]) => ({
      name,
      value,
    }));

    this.table.updateData(rows); // ✅ update row เดิม
  }
}
