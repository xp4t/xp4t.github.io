// ---- fill in your real profile links here; terminal.js reads the same constants ----
window.SITE_LINKS = {
  linkedin: "https://www.linkedin.com/in/rithwik-vallabhan-tv-b01232220/",
  github: "https://github.com/xp4t",
  instagram: "https://www.instagram.com/rithwik.vallabhan/",
  facebook: "https://www.facebook.com/rithwik.bleh/",
  whatsapp: "https://wa.me/919188452806",
  email: "rithwikvallabhantv@gmail.com",
  phone: "+91 91884 52806",
  location: "Kochi, Kerala, India"
};

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("#linkedin-link").forEach(el => el.href = window.SITE_LINKS.linkedin);
  document.querySelectorAll("#github-link").forEach(el => el.href = window.SITE_LINKS.github);

  // ---------------- BOOT SEQUENCE ----------------
  const bootOverlay = document.getElementById("boot-overlay");
  const bootLines = document.getElementById("boot-lines");
  const bootScript = [
    "BOOTING XP4T.SYS",
    "LOADING FPGA CONFIGURATION..."
  ];

  function finishBoot() {
    bootOverlay.classList.add("boot-hide");
    document.getElementById("engrave-name").classList.add("engraved");
    setTimeout(() => bootOverlay.remove(), 750);

    const revealOrder = ["reveal-eyebrow", "reveal-role", "reveal-desc", "reveal-meta", "reveal-cue"];
    revealOrder.forEach((id, i) => {
      setTimeout(() => document.getElementById(id)?.classList.add("in"), reduceMotion ? 0 : 700 + i * 380);
    });
  }

  if (reduceMotion) {
    finishBoot();
  } else {
    let i = 0;
    bootLines.textContent = "";
    const typeLine = () => {
      if (i < bootScript.length) {
        bootLines.textContent += (i > 0 ? "\n" : "") + bootScript[i];
        i++;
        setTimeout(typeLine, 420);
      } else {
        runProgressBar();
      }
    };
    const runProgressBar = () => {
      let pct = 0;
      bootLines.textContent += "\n";
      const barLineIndex = bootLines.textContent.length;
      const iv = setInterval(() => {
        pct += Math.ceil(Math.random() * 18) + 6;
        if (pct >= 100) pct = 100;
        const filled = Math.round(pct / 5);
        const bar = "█".repeat(filled) + "░".repeat(20 - filled);
        bootLines.textContent = bootLines.textContent.slice(0, barLineIndex) + bar + "  " + pct + "%";
        if (pct >= 100) {
          clearInterval(iv);
          setTimeout(() => {
            bootLines.textContent += "\nSYSTEM READY";
            setTimeout(finishBoot, 500);
          }, 250);
        }
      }, 110);
    };
    setTimeout(typeLine, 200);
  }

  // ---------------- NAV RAIL: smooth scroll + active state ----------------
  const navLinks = Array.from(document.querySelectorAll("#nav-rail a"));
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      document.querySelector(link.getAttribute("data-target"))
        ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });
  const sections = navLinks.map(l => document.querySelector(l.getAttribute("data-target"))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = "#" + entry.target.id;
        navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("data-target") === id));
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => spy.observe(s));

  // ---------------- SCROLL REVEAL ----------------
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));

  // ---------------- NOTEBOOK PAGES ----------------
  const pages = Array.from(document.querySelectorAll(".page"));
  const indicator = document.getElementById("page-indicator");
  let current = 0;
  function showPage(idx) {
    current = (idx + pages.length) % pages.length;
    pages.forEach((p, i) => p.classList.toggle("active", i === current));
    indicator.textContent = String(current + 1).padStart(2, "0") + " / " + String(pages.length).padStart(2, "0");
  }
  document.getElementById("page-next")?.addEventListener("click", () => showPage(current + 1));
  document.getElementById("page-prev")?.addEventListener("click", () => showPage(current - 1));

  // ---------------- PUBLICATIONS UNFOLD ----------------
  document.querySelectorAll(".paper-face").forEach(btn => {
    btn.addEventListener("click", () => {
      const paper = btn.closest(".paper");
      const isOpen = paper.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen);
    });
  });

  // ---------------- RESEARCH DESK: TOOL DRAWER ----------------
  const TOOL_INFO = {
    verilog: "Used across RTL design — from the 16-bit RISC-V core to the OV7670 camera ASIC.",
    sverilog: "Used to verify RTL designs during FPGA and ASIC work.",
    vhdl: "Used for the CMV4000 image-acquisition RTL built during the IIA Bangalore internship.",
    vivado: "FPGA implementation flow — synthesis, place and route — plus Vitis embedded software for Zynq SoC designs.",
    vitisai: "Quantization, compilation and on-device deployment of InceptionV3 for the IntelliWatch project.",
    synopsys: "Full RTL-to-GDS ASIC back-end flow — synthesis through GDS generation — on the OV7670 ASIC.",
    pt: "Signoff static timing analysis for the OV7670 ASIC, closing timing with zero setup and hold violations.",
    oss: "Additional synthesis and open-source EDA exposure alongside the commercial flow.",
    linux: "Scripting and embedded control software — course automation, data pipelines, and sensor control code."
  };
  const drawer = document.getElementById("tool-drawer");
  const drawerTitle = document.getElementById("tool-drawer-title");
  const drawerBody = document.getElementById("tool-drawer-body");
  document.querySelectorAll(".tool-label").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tool-label").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      drawerTitle.textContent = btn.textContent;
      drawerBody.textContent = TOOL_INFO[btn.dataset.tool] || "";
      drawer.classList.add("open");
    });
  });

  // ---------------- KONAMI CODE ----------------
  const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let pos = 0;
  document.addEventListener("keydown", e => {
    pos = (e.key === seq[pos]) ? pos + 1 : (e.key === seq[0] ? 1 : 0);
    if (pos === seq.length) {
      pos = 0;
      const banner = document.getElementById("konami-banner");
      banner.classList.add("show");
      setTimeout(() => banner.classList.remove("show"), 3200);
      window.dispatchEvent(new CustomEvent("konami-unlocked"));
    }
  });
});
