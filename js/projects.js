// Fallback copy of data/projects.json — used if fetch() is blocked (e.g. opening
// this file directly as file:// instead of serving it, which browsers restrict).
// When hosted on GitHub Pages / rithwik.is-a.dev, the fetch below will succeed
// and this fallback is never used.
const PROJECTS_FALLBACK = {
  ov7670: {
    name: "OV7670 Camera ASIC — RTL-to-GDS",
    kind: "stages",
    repo: "https://github.com/xp4t/OV7670-camera-asic",
    stages: ["FLOORPLAN", "PLACEMENT", "CTS", "ROUTING", "GDS"],
    specs: [
      "PROCESS   SAED 32nm RVT",
      "TOOLS     Synopsys DC + ICC2",
      "TIMING    WNS +8.90ns · 0 TNS · 0 hold violations (SS/FF)",
      "PHYSICAL  LVS clean · 273 cells · 855 \u00b5m\u00b2"
    ]
  },
  intelliwatch: {
    name: "IntelliWatch — Anomaly Detection (FPGA CNN)",
    kind: "console",
    repo: "https://github.com/xp4t/anomaly_detection_fpga",
    rows: [
      { label: "TASK", value: "Real-time surveillance anomaly detection" },
      { label: "TARGET", value: "Zynq SoC · DPU" },
      { label: "TOOLCHAIN", value: "Vitis AI · PetaLinux" }
    ],
    fps_target: 110,
    dpu_util_target: 78
  },
  riscv: {
    name: "16-bit RISC-V Processor",
    kind: "datapath",
    repo: "https://github.com/xp4t/processor_16b",
    specs: [
      "LANGUAGE   Verilog",
      "VERIFY     Vivado simulation",
      "MEMORY     256 × 16 RAM",
      "STATUS     Instruction execution verified"
    ]
  },
  "rtl2gdsagi": {
    "name": "rtl2gdsagi — RTL-to-GDS Automation",
    "kind": "details",
    "repo": "https://github.com/xp4t/rtl2gdsagi",
    "specs": [
      "FLOW      Yosys → OpenSTA → OpenLane → KLayout",
      "PDK       SKY130",
      "REPAIR    Claude-assisted RTL fixes, SDC/TCL generation and failure analysis",
      "CHECKS    Fixed two DRC/LVS false-pass bugs with regression tests",
      "TESTING   11-module OV7670 fixture · 37 passing tests (resume milestone)"
    ]
  },
  "fpga_playground": {
    "name": "FPGA Playground",
    "kind": "details",
    "repo": "https://github.com/xp4t/fpga-playground",
    "specs": [
      "WORKBENCH Edit Verilog, synthesize, simulate and export Artix-7 bitstreams",
      "BOARDS    Basys 3 · Nexys A7 100T · Arty A7 100T",
      "TOOLS     Yosys · Icarus Verilog · open XC7 or Vivado",
      "PREVIEW   Virtual switches, buttons, LEDs and waveforms · CSV export",
      "BITSTREAM Requires an installed FPGA backend; board preview uses RTL simulation or supported Basys 3 bitstream decoding"
    ]
  }
};

let PROJECTS = PROJECTS_FALLBACK;

fetch("data/projects.json")
  .then(r => (r.ok ? r.json() : Promise.reject()))
  .then(json => { PROJECTS = json; })
  .catch(() => { /* keep fallback */ });

function repoLink(data) {
  return data.repo
    ? `<a class="repo-link" href="${data.repo}" target="_blank" rel="noopener">→ View repository on GitHub ↗</a>`
    : "";
}

function renderStages(data) {
  const steps = data.stages
    .map((s, i) => `<span class="stage-step" data-i="${i}">${s}</span>` + (i < data.stages.length - 1 ? '<span class="arrow">→</span>' : ""))
    .join("");
  return `
    <h3>${data.name}</h3>
    <div class="stage-stepper">${steps}</div>
    <div class="spec-lines">${data.specs.join("<br>")}</div>
    ${repoLink(data)}
  `;
}

function renderConsole(data) {
  const rows = data.rows.map(r => `<div class="console-row"><span>${r.label}</span><span>${r.value}</span></div>`).join("");
  return `
    <h3>${data.name}</h3>
    <div class="console-panel">
      ${rows}
      <div class="console-row"><span>INFERENCE FPS</span><span id="fps-val">0</span></div>
      <div class="console-row"><span>DPU UTILISATION</span><span id="dpu-val">0%</span></div>
      <div class="meter"><div class="meter-fill" id="dpu-meter"></div></div>
    </div>
    ${repoLink(data)}
  `;
}

function renderDatapath(data) {
  return `
    <h3>${data.name}</h3>
    <svg class="datapath" viewBox="0 0 600 120" role="img" aria-label="Simplified processor datapath">
      <path class="wire" d="M40,60 L560,60"/>
      ${["PC","IMEM","DECODE","REGFILE","ALU","DMEM"].map((label,i) => {
        const x = 40 + i * 104;
        return `<rect x="${x-30}" y="40" width="60" height="40"/><text x="${x}" y="64" text-anchor="middle">${label}</text>`;
      }).join("")}
      <circle class="pulse" id="dp-pulse" r="5" cx="40" cy="60" style="offset-path: path('M40,60 L560,60'); offset-rotate: 0deg;"></circle>
    </svg>
    <button class="run-btn" id="dp-run">▶ RUN INSTRUCTION</button>
    <div class="spec-lines">${data.specs.join("<br>")}</div>
    ${repoLink(data)}
  `;
}

function renderDetails(data) {
  return `
    <h3>${data.name}</h3>
    <div class="spec-lines">${data.specs.join("<br>")}</div>
    ${repoLink(data)}
  `;
}

function renderProject(id) {
  const data = PROJECTS[id];
  const el = document.getElementById("project-detail");
  if (!data || !el) return;

  if (data.kind === "stages") {
    el.innerHTML = renderStages(data);
    const steps = Array.from(el.querySelectorAll(".stage-step"));
    steps.forEach((s, i) => setTimeout(() => s.classList.add("on"), 180 * i));
  } else if (data.kind === "console") {
    el.innerHTML = renderConsole(data);
    const fpsEl = document.getElementById("fps-val");
    const dpuEl = document.getElementById("dpu-val");
    const meter = document.getElementById("dpu-meter");
    let fps = 0;
    const target = data.fps_target || 110;
    const dpuTarget = data.dpu_util_target || 78;
    const iv = setInterval(() => {
      fps = Math.min(target, fps + Math.ceil(target / 24));
      fpsEl.textContent = fps;
      if (fps >= target) clearInterval(iv);
    }, 60);
    requestAnimationFrame(() => {
      meter.style.width = dpuTarget + "%";
      dpuEl.textContent = dpuTarget + "%";
    });
  } else if (data.kind === "datapath") {
    el.innerHTML = renderDatapath(data);
    const btn = document.getElementById("dp-run");
    const pulse = document.getElementById("dp-pulse");
    btn.addEventListener("click", () => {
      pulse.classList.remove("run");
      void pulse.offsetWidth; // restart the CSS animation
      pulse.classList.add("run");
    });
  } else if (data.kind === "details") {
    el.innerHTML = renderDetails(data);
  }
}

window.addEventListener("project-selected", e => renderProject(e.detail.project));

// clicking a tab or a PCB trace opens that project's GitHub repo in a new tab
window.addEventListener("project-activate", e => {
  const data = PROJECTS[e.detail.project];
  if (data && data.repo) window.open(data.repo, "_blank", "noopener");
});
