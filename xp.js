const desktop = document.getElementById("desktop");
const tasks = document.getElementById("tasks");
const startButton = document.getElementById("start");
const startMenu = document.getElementById("startmenu");
const startList = document.getElementById("startlist");
const clock = document.getElementById("clock");
const touchOnly = matchMedia("(pointer: coarse)").matches;

const svg = (body) => `<svg viewBox="0 0 40 40" aria-hidden="true">${body}</svg>`;
const icons = {
  cv: svg('<path d="M9 3h16l7 7v27H9z" fill="#fff" stroke="#555"/><path d="M25 3v7h7" fill="#ddd" stroke="#555"/><path d="M13 17h14M13 22h14M13 27h10" stroke="#2a6fd6" stroke-width="2"/>'),
  experience: svg('<rect x="4" y="12" width="32" height="22" rx="2" fill="#a0642a" stroke="#5a3510"/><path d="M14 12V8h12v4" fill="none" stroke="#5a3510" stroke-width="2"/><path d="M4 22h32" stroke="#5a3510"/><rect x="17" y="20" width="6" height="5" fill="#f5d36a" stroke="#5a3510"/>'),
  linkedin: svg('<rect x="4" y="4" width="32" height="32" rx="4" fill="#0a66c2"/><path d="M11 17h4v12h-4zM13 10.5a2.3 2.3 0 110 4.6 2.3 2.3 0 010-4.6zM18 17h4v2c1-1.600 2.500-2.400 4.500-2.400 3.500 0 4.500 2.200 4.500 5.400V29h-4v-6c0-1.500-.5-2.500-2-2.500s-3 1-3 3V29h-4z" fill="#fff"/>'),
  projects: svg('<path d="M3 10h13l3 4h18v21H3z" fill="#f5d36a" stroke="#a67c00"/><path d="M3 18h34v17H3z" fill="#ffe9a0" stroke="#a67c00"/>'),
  about: svg('<circle cx="20" cy="13" r="7" fill="#f2c9a0" stroke="#555"/><path d="M6 36c0-9 7-13 14-13s14 4 14 13z" fill="#2a6fd6" stroke="#0b3a9e"/>'),
  skills: svg('<rect x="5" y="8" width="30" height="21" rx="2" fill="#222" stroke="#888"/><path d="M10 15l5 4-5 4M18 24h8" stroke="#8ae234" stroke-width="2" fill="none"/><path d="M13 33h14" stroke="#888" stroke-width="3"/>'),
  github: svg('<circle cx="20" cy="20" r="16" fill="#24292f"/><path d="M20 9c-6 0-11 5-11 11 0 5 3 9 8 10v-4c-3 1-4-1-4-1-1-2-2-2-2-2-1-1 0-1 0-1 2 0 3 2 3 2 1 2 3 2 4 1 0-1 1-2 1-2-4-1-6-3-6-7 0-2 1-3 2-4 0-1-1-2 0-4 0 0 2 0 4 2 2-1 4-1 6 0 2-2 4-2 4-2 1 2 0 3 0 4 1 1 2 2 2 4 0 4-2 6-6 7 1 1 1 2 1 3v5c5-1 8-5 8-10 0-6-5-11-11-11z" fill="#fff"/>'),
  contact: svg('<rect x="4" y="9" width="32" height="22" rx="2" fill="#fff" stroke="#555"/><path d="M4 11l16 12 16-12" fill="none" stroke="#2a6fd6" stroke-width="2"/>')
};

const linkTag = (url, text) => `<a href="${url}" target="_blank" rel="noopener">${text || url}</a>`;

const apps = {
  cv: {
    title: "My CV",
    html: () => `<h2>${me.name} - CV</h2><a class="btn" href="${me.cv}" download="Nima_Mahini_CV.pdf">Download CV</a><iframe class="cvframe" src="${me.cv}" title="CV preview"></iframe>`
  },
  projects: {
    title: "My Projects",
    html: () => `<h2>Projects</h2>` + me.projects.map((p) => `<div class="item"><b>${p.name}</b>${p.desc}${p.url ? "<br>" + linkTag(p.url) : ""}</div>`).join("")
  },
  experience: {
    title: "Experience",
    html: () =>
      `<h2>Experience</h2>` +
      me.experience
        .map((e) => `<div class="item"><b>${e.company} - ${e.role}</b><i>${e.period}${e.place ? ", " + e.place : ""}</i><ul>` + e.points.map((p) => `<li>${p}</li>`).join("") + `</ul></div>`)
        .join("")
  },
  about: {
    title: "About Me",
    html: () => `<h2>${me.name}</h2><p><b>${me.role}</b></p>` + me.about.map((t) => `<p>${t}</p>`).join("")
  },
  skills: {
    title: "Skills",
    html: () => `<h2>Skills</h2>` + me.skills.map((s) => `<div class="item"><b>${s.group}</b>${s.items.join(", ")}</div>`).join("")
  },
  github: {
    title: "GitHub",
    html: () => `<h2>GitHub</h2><p>See my code here:</p><p>${linkTag(me.github)}</p>`
  },
  linkedin: {
    title: "LinkedIn",
    html: () => `<h2>LinkedIn</h2><p>Find me here:</p><p>${linkTag(me.linkedin)}</p>`
  },
  contact: {
    title: "Contact",
    html: () => `<h2>Contact</h2><p>Email: ${linkTag("mailto:" + me.email, me.email)}</p><p>GitHub: ${linkTag(me.github)}</p><p>LinkedIn: ${linkTag(me.linkedin)}</p><p>Location: ${me.location}</p>`
  }
};

const open = {};
let topZ = 10;
let openCount = 0;

function focusWindow(id) {
  Object.entries(open).forEach(([key, w]) => {
    const active = key === id;
    w.el.classList.toggle("inactive", !active);
    w.task.classList.toggle("active", active);
  });
  open[id].el.style.zIndex = ++topZ;
}

function closeWindow(id) {
  open[id].el.remove();
  open[id].task.remove();
  delete open[id];
  const rest = Object.keys(open);
  if (rest.length) focusWindow(rest[rest.length - 1]);
}

function makeDraggable(win, handle) {
  handle.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    const dx = e.clientX - win.offsetLeft;
    const dy = e.clientY - win.offsetTop;
    handle.setPointerCapture(e.pointerId);
    const move = (m) => {
      win.style.left = Math.max(0, m.clientX - dx) + "px";
      win.style.top = Math.max(0, Math.min(m.clientY - dy, innerHeight - 76)) + "px";
    };
    const stop = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
  });
}

function openApp(id) {
  startMenu.hidden = true;
  startButton.setAttribute("aria-expanded", "false");
  if (open[id]) return focusWindow(id);
  const app = apps[id];
  const win = document.createElement("section");
  win.className = "window";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", app.title);
  win.style.left = 110 + (openCount % 6) * 28 + "px";
  win.style.top = 24 + (openCount % 6) * 28 + "px";
  win.style.width = id === "cv" ? "min(520px, 92vw)" : "min(420px, 92vw)";
  openCount++;
  win.innerHTML = `<div class="titlebar"><span>${app.title}</span><button class="close" aria-label="Close ${app.title}">X</button></div><div class="body">${app.html()}</div>`;
  document.body.appendChild(win);

  const task = document.createElement("button");
  task.className = "task";
  task.textContent = app.title;
  tasks.appendChild(task);

  open[id] = { el: win, task };
  makeDraggable(win, win.querySelector(".titlebar"));
  win.addEventListener("pointerdown", () => focusWindow(id));
  win.querySelector(".close").addEventListener("click", () => closeWindow(id));
  task.addEventListener("click", () => focusWindow(id));
  focusWindow(id);
}

Object.entries(apps).forEach(([id, app]) => {
  const btn = document.createElement("button");
  btn.className = "icon";
  btn.innerHTML = icons[id] + `<span>${app.title}</span>`;
  btn.addEventListener("click", () => {
    desktop.querySelectorAll(".icon").forEach((i) => i.classList.remove("selected"));
    btn.classList.add("selected");
    if (touchOnly) openApp(id);
  });
  btn.addEventListener("dblclick", () => openApp(id));
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openApp(id);
  });
  desktop.appendChild(btn);

  const item = document.createElement("button");
  item.innerHTML = icons[id] + `<span>${app.title}</span>`;
  item.addEventListener("click", () => openApp(id));
  startList.appendChild(item);
});

startList.appendChild(document.createElement("hr"));
const back = document.createElement("button");
back.innerHTML = "<span>Log off (back to start)</span>";
back.addEventListener("click", () => (location.href = "index.html"));
startList.appendChild(back);

startButton.addEventListener("click", (e) => {
  e.stopPropagation();
  startMenu.hidden = !startMenu.hidden;
  startButton.setAttribute("aria-expanded", String(!startMenu.hidden));
});
document.addEventListener("click", (e) => {
  if (!startMenu.contains(e.target)) {
    startMenu.hidden = true;
    startButton.setAttribute("aria-expanded", "false");
  }
  if (!e.target.closest(".icon")) desktop.querySelectorAll(".icon").forEach((i) => i.classList.remove("selected"));
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") startMenu.hidden = true;
});

const tick = () => (clock.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
tick();
setInterval(tick, 10000);
