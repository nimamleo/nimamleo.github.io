const out = document.getElementById("out");
const input = document.getElementById("cmd");
const screen = document.getElementById("screen");
const history = [];
let historyIndex = 0;

const link = (url, text) => `<a href="${url}" target="_blank" rel="noopener">${text || url}</a>`;

const commands = {
  help: () => [
    "Commands:",
    "  about      who I am",
    "  skills     what I use",
    "  experience where I worked",
    "  projects   what I built",
    "  github     my GitHub link",
    "  linkedin   my LinkedIn link",
    "  cv         download my CV",
    "  contact    how to reach me",
    "  whoami     short intro",
    "  clear      clean the screen",
    "  exit       go back to the start page"
  ].join("\n"),
  about: () => me.about.join("\n\n"),
  skills: () => me.skills.map((s) => `${s.group}: ${s.items.join(", ")}`).join("\n\n"),
  experience: () =>
    me.experience
      .map((e) => `${e.company} - ${e.role}${e.place ? " (" + e.place + ")" : ""}\n${e.period}\n` + e.points.map((p) => "  - " + p).join("\n"))
      .join("\n\n"),
  projects: () => me.projects.map((p) => `${p.name}\n  ${p.desc}` + (p.url ? `\n  ${link(p.url)}` : "")).join("\n\n"),
  github: () => link(me.github),
  linkedin: () => link(me.linkedin),
  cv: () => {
    const a = document.createElement("a");
    a.href = me.cv;
    a.download = "Nima_Mahini_CV.pdf";
    a.click();
    return "Downloading " + me.cv + " ...";
  },
  contact: () => "Email: " + link("mailto:" + me.email, me.email) + "\nGitHub: " + link(me.github) + "\nLinkedIn: " + link(me.linkedin) + "\nLocation: " + me.location,
  whoami: () => `${me.name} - ${me.role}`,
  clear: () => {
    out.innerHTML = "";
    return null;
  },
  exit: () => {
    location.href = "index.html";
    return "Bye.";
  }
};

function print(html, cls) {
  const row = document.createElement("pre");
  row.className = "row " + (cls || "");
  row.innerHTML = html;
  out.appendChild(row);
}

function run(raw) {
  const name = raw.trim().toLowerCase();
  print(`<span class="prompt">guest@nima:~$</span> ${raw.replace(/</g, "&lt;")}`);
  if (!name) return;
  history.push(raw);
  historyIndex = history.length;
  const fn = commands[name];
  const result = fn ? fn() : `${name.replace(/</g, "&lt;")}: command not found. Type "help".`;
  if (result !== null) print(result);
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    run(input.value);
    input.value = "";
    screen.scrollTop = screen.scrollHeight;
  } else if (e.key === "ArrowUp" && historyIndex > 0) {
    input.value = history[--historyIndex];
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    historyIndex = Math.min(historyIndex + 1, history.length);
    input.value = history[historyIndex] || "";
    e.preventDefault();
  } else if (e.key === "Tab") {
    const match = Object.keys(commands).find((c) => c.startsWith(input.value.toLowerCase()));
    if (match && input.value) input.value = match;
    e.preventDefault();
  }
});

screen.addEventListener("click", () => {
  if (!getSelection().toString()) input.focus();
});

print(`Welcome. I am ${me.name}, ${me.role}.`, "dim");
print('Type "help" to see commands.', "dim");
