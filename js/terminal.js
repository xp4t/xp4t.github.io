document.addEventListener("DOMContentLoaded", () => {
  const body = document.getElementById("term-body");
  const input = document.getElementById("term-input");
  if (!body || !input) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function printLine(html) {
    const line = document.createElement("div");
    line.innerHTML = html;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function bootLine(text, delay) {
    return new Promise(resolve => {
      setTimeout(() => { printLine(text); resolve(); }, delay);
    });
  }

  async function runIntro() {
    if (reduceMotion) {
      printLine("connect github &nbsp; <span class='ok'>✓ connected</span>");
      printLine("connect linkedin &nbsp; <span class='ok'>✓ connected</span>");
      printLine("standing by.");
      return;
    }
    await bootLine("$ connect github", 200);
    await bootLine("<span class='ok'>✓ connected</span>", 500);
    await bootLine("$ connect linkedin", 300);
    await bootLine("<span class='ok'>✓ connected</span>", 500);
    await bootLine("standing by. type <code>help</code>.", 400);
  }
  runIntro();

  const L = window.SITE_LINKS || {};
  const open = url => window.open(url, "_blank", "noopener");
  const scrollToId = id =>
    document.querySelector(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

  function contactBlock(asRoot) {
    const prefix = asRoot ? "[sudo] password accepted — printing resume summary…<br><br>" : "";
    return prefix + [
      `NAME &nbsp;&nbsp;&nbsp;&nbsp;Rithwik Vallabhan TV`,
      `ROLE &nbsp;&nbsp;&nbsp;&nbsp;FPGA / SoC / ASIC Engineer`,
      `EMAIL &nbsp;&nbsp;&nbsp;<a href="mailto:${L.email}">${L.email}</a>`,
      `PHONE &nbsp;&nbsp;&nbsp;<a href="tel:+919188452806">${L.phone}</a>`,
      `LOCATION ${L.location}`,
      `LINKEDIN <a href="${L.linkedin}" target="_blank" rel="noopener">linkedin.com/in/rithwik-vallabhan-tv</a>`,
      `GITHUB &nbsp;&nbsp;<a href="${L.github}" target="_blank" rel="noopener">github.com/xp4t</a>`,
      `WHATSAPP <a href="${L.whatsapp}" target="_blank" rel="noopener">wa.me/919188452806</a>`,
      `STATUS &nbsp;&nbsp;open to FPGA / VLSI roles — India &amp; Germany`
    ].join("<br>");
  }

  function resumeBlock() {
    return [
      "EDUCATION &nbsp;B.Tech ECE, Adi Shankara Inst. of Engg. & Tech · 2021–2025",
      "EXPERIENCE Project Engineer, NIELIT Calicut (SMART Lab) · Aug 2025–present",
      "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FPGA Design Intern, Indian Institute of Astrophysics · Feb–Aug 2025",
      "SKILLS &nbsp;&nbsp;&nbsp;Verilog, SystemVerilog, VHDL, Vivado, Vitis AI, Synopsys DC/ICC2, PrimeTime",
      "PAPERS &nbsp;&nbsp;&nbsp;2 published — type <code>papers</code> to view",
      "",
      contactBlock()
    ].join("<br>");
  }

  async function compileSequence() {
    const steps = [
      "Running synthesis…",
      "Elaborating design…",
      "Mapping to LUTs…",
      "Placing & routing…",
      "Generating bitstream…"
    ];
    for (const s of steps) {
      // eslint-disable-next-line no-await-in-loop
      await bootLine(s, 260);
    }
    printLine("<span class='ok'>bitstream.bit written ✓ — 0 timing violations</span>");
  }

  const COMMANDS = {
    help: () => [
      "available commands:",
      "&nbsp;&nbsp;help, projects, publications, notebook, research-desk, lab,",
      "&nbsp;&nbsp;whoami, resume, cat resume.txt, papers, skills, compile,",
      "&nbsp;&nbsp;contact, linkedin, github, instagram, facebook, whatsapp, email,",
      "&nbsp;&nbsp;vivado, clear, make clean, exit, sudo hire-rithwik",
      "&nbsp;&nbsp;<span style='opacity:.6'>↑ / ↓ recall history · tab to autocomplete</span>"
    ].join("<br>"),
    projects: () => { scrollToId("#design-table"); return "→ opening design table…"; },
    publications: () => { scrollToId("#publications"); return "→ opening publications shelf…"; },
    papers: () => { scrollToId("#publications"); return "→ opening publications shelf…"; },
    notebook: () => { scrollToId("#notebook"); return "→ opening notebook…"; },
    "research-desk": () => { scrollToId("#research-desk"); return "→ opening research desk…"; },
    skills: () => { scrollToId("#research-desk"); return "→ opening research desk…"; },
    lab: () => { scrollToId("#lab"); return "→ returning to lab…"; },
    whoami: () => "rithwik vallabhan tv — fpga / soc / asic engineer, kochi, kerala.",
    resume: () => resumeBlock(),
    "cat resume.txt": () => resumeBlock(),
    contact: () => contactBlock(),
    linkedin: () => { open(L.linkedin); return "→ opening linkedin.com/in/rithwik-vallabhan-tv…"; },
    github: () => { open(L.github); return "→ opening github.com/xp4t…"; },
    instagram: () => { open(L.instagram); return "→ opening instagram…"; },
    facebook: () => { open(L.facebook); return "→ opening facebook…"; },
    whatsapp: () => { open(L.whatsapp); return "→ opening whatsapp…"; },
    email: () => { window.location.href = `mailto:${L.email}`; return `→ mailto:${L.email}`; },
    vivado: () => {
      document.body.classList.toggle("theme-vivado");
      return document.body.classList.contains("theme-vivado")
        ? "theme: vivado (amber accent) enabled."
        : "theme: default (copper accent) restored.";
    },
    compile: () => { compileSequence(); return null; },
    clear: () => { body.innerHTML = ""; return null; },
    "make clean": () => { body.innerHTML = ""; return null; },
    exit: () => { scrollToId("#lab"); return "connection closed. reload to reconnect — returning to lab."; },
    "sudo hire-rithwik": () => contactBlock(true)
  };

  // ---- command history + tab completion ----
  const history = [];
  let historyPos = 0;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const raw = input.value.trim();
      if (!raw) return;
      printLine(`<span class="term-prompt">$</span> ${raw}`);
      if (history[history.length - 1] !== raw) history.push(raw);
      historyPos = history.length;
      input.value = "";
      const handler = COMMANDS[raw.toLowerCase()];
      if (handler) {
        const out = handler();
        if (out) printLine(out);
      } else {
        printLine(`command not found: ${raw}. type <code>help</code>.`);
      }
      return;
    }
    if (e.key === "ArrowUp") {
      if (historyPos > 0) { historyPos--; input.value = history[historyPos] || ""; }
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      if (historyPos < history.length) { historyPos++; input.value = history[historyPos] || ""; }
      e.preventDefault();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const partial = input.value.toLowerCase();
      if (!partial) return;
      const matches = Object.keys(COMMANDS).filter(c => c.startsWith(partial));
      if (matches.length === 1) {
        input.value = matches[0];
      } else if (matches.length > 1) {
        printLine(`<span class="term-prompt">$</span> ${input.value}`);
        printLine(matches.join("&nbsp;&nbsp;"));
      }
    }
  });

  window.addEventListener("konami-unlocked", () => {
    printLine("<span class='ok'>[hidden] engineering sandbox unlocked.</span>");
  });
});
