const grid = document.querySelector("#mission-grid");
const dialog = document.querySelector("#mission-dialog");
const body = document.querySelector("#dialog-body");
const finalButton = document.querySelector("#final-button");
const storageKey = "byummy-mission-progress-v1";
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const completed = new Set();
let finalComplete = false;
let session;
let opener;
let frame;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(saved?.missions)) {
    missions.forEach((mission, index) => {
      if (saved.missions.includes(index)) completed.add(index);
    });
    finalComplete = saved.final === true && completed.size === missions.length;
  }
} catch {
  // The missions still work when browser storage is unavailable.
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ missions: [...completed], final: finalComplete }));
  } catch {
    // Progress remains available until the page closes.
  }
  showProgress();
}

function showProgress() {
  document.querySelectorAll("[data-count]").forEach(node => {
    node.textContent = `${completed.size} / ${missions.length}`;
  });
  document.querySelector("#progress").value = completed.size;
  document.querySelector(".header-progress").setAttribute("aria-label", `Mission progress, ${completed.size} of ${missions.length} completed`);
  grid.querySelectorAll("button").forEach((button, index) => {
    const done = completed.has(index);
    const action = done ? "Replay mission" : "Start mission";
    button.innerHTML = `${action} <span aria-hidden="true">${done ? "✓" : "→"}</span>`;
    button.setAttribute("aria-label", `${action} for ${missions[index].name}`);
  });
  finalButton.disabled = completed.size < missions.length;
  if (!finalButton.disabled) {
    finalButton.innerHTML = `${finalComplete ? "Fly again" : "Open simulator"} <span aria-hidden="true">↗</span>`;
    document.querySelector("#final-description").textContent = finalComplete
      ? "Final mission complete! Try a new destination or fly the same route again."
      : "All six missions are complete. Choose a destination and use every school subject to prepare for liftoff.";
  }
}

function openMission(index, button) {
  opener = button;
  session = { index, step: 0, destination: 0, badge: "", route: 0 };
  render();
  dialog.showModal();
  focusHeading();
}

function render() {
  const { index, step } = session;
  const mission = missions[index];
  const isFinal = index === -1;
  dialog.style.setProperty("--theme", mission?.theme ?? "#2147d2");
  dialog.style.setProperty("--tint", mission?.tint ?? "#e3e9ff");
  document.querySelector("#dialog-label").textContent = isFinal ? "FINAL MISSION" : `MISSION ${String(index + 1).padStart(2, "0")} · ${mission.name.toUpperCase()}`;

  if (isFinal && step === 0) {
    body.innerHTML = `
      <h2 id="screen-title" tabindex="-1">Choose a destination</h2>
      <p class="briefing">Make six decisions before launch. Your destination changes the route and the science tools you’ll need.</p>
      <label class="flight-select">Destination
        <select id="destination">${destinations.map((planet, n) => `<option value="${n}" ${n === session.destination ? "selected" : ""}>${planet.name} · ${planet.detail}</option>`).join("")}</select>
      </label>
      ${flightMarkup()}
      <div class="dialog-actions"><button class="button blue" id="next" type="button">Start flight checks <span aria-hidden="true">→</span></button></div>`;
    body.querySelector("#destination").addEventListener("change", event => {
      session.destination = Number(event.target.value);
      previewFlight();
    });
    previewFlight();
  } else if (!isFinal && step < mission.lessons.length) {
    const [title, copy] = mission.lessons[step];
    body.innerHTML = `
      ${stepMarkup(step + 1, mission.lessons.length + 1, "Step")}
      <h2 id="screen-title" tabindex="-1">${title}</h2>
      <p class="briefing">${copy}</p>
      <div class="dialog-actions">
        ${step > 0 ? backMarkup() : ""}
        <button class="button blue" id="next" type="button">${step + 1 === mission.lessons.length ? "Play minigame" : "Next step"} <span aria-hidden="true">→</span></button>
      </div>`;
  } else if (isFinal && step > missions.length) {
    const planet = destinations[session.destination];
    body.innerHTML = `
      <h2 id="screen-title" tabindex="-1">All systems go!</h2>
      <p class="briefing">All six flight checks passed. Your rocket is cleared for ${planet.name}.</p>
      ${flightMarkup()}
      <p class="flight-stats">Destination: <strong>${planet.name}</strong> · Distance: <strong>${planet.distance} map units</strong></p>
      <p class="feedback success" id="feedback" role="status"></p>
      <div class="dialog-actions"><button class="button orange" id="launch" type="button">Begin countdown <span aria-hidden="true">↗</span></button></div>`;
    body.querySelector("#launch").addEventListener("click", () => fly(true));
    previewFlight();
  } else {
    const check = isFinal ? missions[step - 1] : mission;
    const task = isFinal ? check.final[session.destination] ?? check.final[0] : check.task;
    renderChallenge(check, task, isFinal);
  }
  body.querySelector("#next")?.addEventListener("click", () => changeStep(1));
  body.querySelector("#back")?.addEventListener("click", () => changeStep(-1));
  focusHeading();
}

function stepMarkup(step, total, label) {
  const segments = Array.from({ length: total }, (_, i) => `<span class="${i < step ? "active" : ""}"></span>`);
  return `<p class="eyebrow accent">${label} ${step} of ${total}</p><div class="steps" aria-hidden="true">${segments.join("")}</div>`;
}

function flightMarkup() {
  return '<canvas id="flight" class="flight" width="720" height="205" aria-label="Rocket flight map"></canvas>';
}

function backMarkup() {
  return '<button class="button quiet" id="back" type="button">← Back</button>';
}

function changeStep(direction) {
  session.step += direction;
  render();
}

function focusHeading() {
  dialog.scrollTop = 0;
  if (dialog.open) body.querySelector("#screen-title").focus({ preventScroll: true });
}

function renderChallenge(check, [title, prompt, choices, answer, hint, result], isFinal) {
  const math = check === missions[0];
  const art = check === missions[3];
  const isPreview = !isFinal || math || art;
  const current = isFinal ? session.step : check.lessons.length + 1;
  const total = isFinal ? missions.length : current;
  body.innerHTML = `
    ${stepMarkup(current, total, isFinal ? "Flight check" : "Step")}
    <h2 id="screen-title" tabindex="-1">${title}</h2>
    ${isFinal ? `<p class="eyebrow accent">${check.name}</p>` : ""}
    <form>
      <fieldset class="choices">
        <legend>${prompt}</legend>
        ${choices.map((choice, index) => `<label class="choice"><input type="radio" name="choice" value="${index}" required><span>${choice}</span></label>`).join("")}
      </fieldset>
      ${isPreview ? flightMarkup() : ""}
      <p class="feedback" id="feedback" role="status"></p>
      <div class="dialog-actions">
        ${isFinal ? "" : backMarkup()}
        <button class="button ${isFinal ? "blue" : "orange"}" type="submit">${isFinal ? "Check decision" : "Try launch"} <span aria-hidden="true">↗</span></button>
      </div>
    </form>`;
  const form = body.querySelector("form");
  const feedback = body.querySelector("#feedback");
  const selectedColor = index => (isFinal ? ["#fff", "#121f49", "#cad0df"] : ["#482967", "#1a3379", "#ffdf61"])[index];
  function updatePreview(index) {
    previewFlight({
      route: math && index >= 0 ? Number.parseInt(choices[index], 10) : 0,
      target: math ? (isFinal ? destinations[session.destination].distance / 3 : 4) : 0,
      stripe: art && index >= 0 ? selectedColor(index) : undefined,
      dark: art && !isFinal
    });
  }
  form.addEventListener("change", () => {
    feedback.textContent = "";
    if (isPreview) updatePreview(Number(form.elements.choice.value));
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const selected = Number(form.elements.choice.value);
    if (selected !== answer) {
      feedback.className = "feedback hint";
      feedback.textContent = `Try again. ${hint}`;
      return;
    }
    if (math) session.route = Number.parseInt(choices[selected], 10);
    if (art) session.badge = selectedColor(selected);
    if (isFinal) {
      changeStep(1);
    } else {
      form.querySelector("fieldset").disabled = true;
      form.querySelector("#back").disabled = true;
      fly(false, result);
    }
  });
  if (isPreview) updatePreview(-1);
}

function getPlanet() {
  const mission = missions[session.index];
  return mission ? { name: mission.planet, color: mission.color } : destinations[session.destination];
}

function previewFlight(options = {}) {
  paintFlight(body.querySelector("#flight"), getPlanet(), {
    stripe: session.badge,
    dark: session.index === 3,
    target: session.route,
    ...options
  });
}

function fly(isFinal, result) {
  const active = session;
  const planet = getPlanet();
  const button = body.querySelector("#launch, button[type=submit]");
  const feedback = body.querySelector("#feedback");
  button.disabled = true;
  feedback.className = "feedback success";
  let start;
  let lastLabel = "";
  const countdown = isFinal ? 2700 : 700;
  const duration = isFinal ? 2800 : 1500;
  function advance(time) {
    if (!dialog.open || active !== session) return;
    start ??= time;
    const elapsed = time - start;
    const amount = Math.max(0, Math.min(1, (elapsed - countdown) / duration));
    const label = elapsed < countdown && isFinal
      ? `Liftoff in ${Math.ceil((countdown - elapsed) / 900)}…`
      : isFinal && amount > .76 ? "Entering orbit…" : "Rocket in flight…";
    if (lastLabel !== label) feedback.textContent = label;
    lastLabel = label;
    previewFlight({ amount, orbit: isFinal });
    if (amount < 1 && !motion.matches) {
      frame = requestAnimationFrame(advance);
      return;
    }
    if (isFinal) finalComplete = true;
    else completed.add(active.index);
    saveProgress();
    body.innerHTML = `
      <p class="eyebrow accent">✦ MISSION COMPLETE</p>
      <h2 id="screen-title" tabindex="-1">You reached ${planet.name}!</h2>
      <p class="briefing">${result ?? "Your crew used all six school subjects to prepare, launch, and reach orbit."}</p>
      ${flightMarkup()}
      <div class="dialog-actions"><button class="button blue" id="done" type="button">Back to Mission Control <span aria-hidden="true">→</span></button></div>`;
    previewFlight({ amount: 1, orbit: isFinal });
    body.querySelector("#done").addEventListener("click", () => dialog.close());
    focusHeading();
  }
  frame = requestAnimationFrame(advance);
}

missions.forEach((mission, index) => {
  const card = document.createElement("article");
  card.className = "card";
  card.style.setProperty("--theme", mission.theme);
  card.style.setProperty("--tint", mission.tint);
  card.innerHTML = `
    <div class="card-art">
      <span class="number">MISSION ${String(index + 1).padStart(2, "0")}</span>
      <canvas width="416" height="228" aria-hidden="true"></canvas>
    </div>
    <div class="card-copy">
      <h3>${mission.name}</h3>
      <p>${mission.action}</p>
      <button type="button"></button>
    </div>`;
  const button = card.querySelector("button");
  button.addEventListener("click", () => openMission(index, button));
  paintCard(card.querySelector("canvas"), mission, index);
  grid.append(card);
});
finalButton.addEventListener("click", () => openMission(-1, finalButton));
dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  cancelAnimationFrame(frame);
  session = undefined;
  opener?.focus({ preventScroll: true });
});
paintFlight(document.querySelector("#final-art"), { name: "", color: "#ffb15e" }, { amount: .52, orbit: true });
showProgress();

function stroke(ctx, points, color, width = 3) {
  ctx.beginPath();
  points.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function fill(ctx, points, color) {
  ctx.beginPath();
  points.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function ellipse(ctx, x, y, width, height, color, rotation = 0, outline = false) {
  ctx.beginPath();
  ctx.ellipse(x, y, width, height, rotation, 0, Math.PI * 2);
  if (outline) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function star(ctx, x, y, size, color) {
  fill(ctx, [[x, y-size], [x+size*.24, y-size*.24], [x+size, y], [x+size*.24, y+size*.24], [x, y+size], [x-size*.24, y+size*.24], [x-size, y], [x-size*.24, y-size*.24]], color);
}

function planetArt(ctx, x, y, size, color, ring) {
  ellipse(ctx, x, y, size, size, color);
  ctx.save();
  ctx.clip();
  ellipse(ctx, x - size * .35, y - size * .32, size * .99, size * .81, "#ffffff42", -.55);
  ellipse(ctx, x + size * .2, y + size * .76, size * 1.3, size * .19, "#101a492d", -.28);
  ellipse(ctx, x - size * .1, y + size * .38, size * 1.3, size * .08, "#ffffff5c", -.28);
  ctx.restore();
  if (ring) ellipse(ctx, x, y, size * 1.58, size * .37, ring, -.31, true);
}

function rocket(ctx, x, y, size, angle, stripe, flame, dark = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(size, size);
  const fin = "#f18458";
  if (flame) {
    fill(ctx, [[-8, 14], [-12, 24], [0, 49], [12, 24], [8, 14]], "#fa8e54");
    fill(ctx, [[-6, 17], [-6, 25], [0, 37], [6, 25], [6, 17]], "#ffdf86");
  }
  fill(ctx, [[-10, 0], [-20, 21], [-9, 17], [9, 17], [20, 21], [10, 0]], fin);
  ctx.beginPath();
  ctx.moveTo(0, -33);
  ctx.quadraticCurveTo(17, -21, 11, 16);
  ctx.lineTo(-11, 16);
  ctx.quadraticCurveTo(-17, -21, 0, -33);
  ctx.fillStyle = dark ? "#293e89" : "#fffae8";
  ctx.fill();
  fill(ctx, [[0, -33], [8, -24], [10, -19], [-10, -19], [-8, -24]], fin);
  ellipse(ctx, 0, -9, 6, 6, dark ? "#c6d4ff" : "#253776");
  fill(ctx, [[-12, 4], [12, 4], [11, 10], [-11, 10]], stripe || "#a5b9ff");
  ctx.restore();
}

function paintCard(canvas, { theme, color }, index) {
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);
  const ivory = "#fffcf1";
  ellipse(ctx, 118, 61, 77, 27, theme + "77", -.21, true);
  star(ctx, 48, 24, 8, theme);
  star(ctx, 182, 29, 10, theme);
  star(ctx, 63, 90, 5, theme);
  ellipse(ctx, 167, 90, 3, 3, theme);
  ctx.save();
  ctx.translate(119, 54);
  switch (index) {
    case 0:
      planetArt(ctx, 20, -3, 24, color, theme);
      stroke(ctx, [[-43, 23], [-26, 2], [-7, -4], [17, -20]], theme, 3);
      [[-43, 23], [-26, 2], [-7, -4]].forEach(([x, y]) => ellipse(ctx, x, y, 4, 4, theme));
      rocket(ctx, -19, 12, .56, .83, "", true);
      break;
    case 1:
      planetArt(ctx, -3, 0, 32, color, "");
      fill(ctx, [[-32, 1], [-18, -17], [-8, -3], [1, -15], [21, 12], [-24, 20]], ivory);
      planetArt(ctx, 33, -22, 9, theme, "");
      break;
    case 2:
      ctx.rotate(-.16);
      fill(ctx, [[-34, -22], [32, -22], [32, 23], [-34, 23]], color);
      stroke(ctx, [[-34, 23], [-34, -22], [32, -22], [32, 23], [-34, 23]], theme);
      stroke(ctx, [[-32, -20], [-1, 4], [30, -20]], theme);
      stroke(ctx, [[-32, 20], [-15, -4]], theme);
      stroke(ctx, [[30, 20], [15, -4]], theme);
      star(ctx, 35, -21, 12, ivory);
      break;
    case 3:
      ellipse(ctx, 0, 0, 37, 33, color, -.3);
      rocket(ctx, -2, -2, .82, .55, theme, false);
      stroke(ctx, [[17, 26], [33, 3]], theme, 7);
      stroke(ctx, [[17, 26], [20, 22]], "#f8bd71", 4);
      break;
    case 4: {
      const teeth = Array.from({ length: 32 }, (_, n) => {
        const angle = n * Math.PI / 16;
        const radius = n % 4 < 2 ? 34 : 27;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius];
      });
      fill(ctx, teeth, theme);
      ellipse(ctx, 0, 0, 23, 23, color);
      ellipse(ctx, 0, 0, 12, 12, ivory);
      break;
    }
    case 5:
      ellipse(ctx, -2, 0, 36, 32, color, -.26);
      stroke(ctx, [[-29, 24], [-13, 8], [-14, -6]], theme, 6);
      stroke(ctx, [[13, 24], [25, 9], [24, -4]], theme, 6);
      ellipse(ctx, -14, -11, 15, 7, ivory, -.7);
      ellipse(ctx, 24, -8, 15, 7, ivory, -.7);
      stroke(ctx, [[-3, -20], [6, -23], [15, -21]], theme, 2);
      break;
  }
  ctx.restore();
}

function paintFlight(canvas, planet, { amount = 0, route = 0, target = 0, stripe = "", orbit = false, dark = false } = {}) {
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  [[.12,.23], [.21,.34], [.38,.21], [.46,.64], [.54,.27], [.66,.8], [.73,.16], [.89,.19], [.94,.53], [.34,.89]].forEach(([x,y], i) => {
    star(ctx, w*x, h*y, i % 3 === 0 ? 6 : 3, i % 3 === 0 ? "#ffe1a4" : "#9db0e8");
  });
  const origin = [w * .11, h * .71];
  const end = target ? [w * (.11 + target * .116), h * .43] : [w * .82, h * .46];
  const path = progress => [
    origin[0] + (end[0] - origin[0]) * progress,
    origin[1] + (end[1] - origin[1]) * progress - Math.sin(progress * Math.PI) * h * .34
  ];
  const orbitStart = .76;
  const orbitRadius = h * .29;
  const approach = 1 - orbitRadius / (end[0] - origin[0]);
  const progress = orbit ? Math.min(1, amount / orbitStart) * approach : amount * .94;
  const point = path(progress);
  let angle = .8;
  if (orbit && amount > orbitStart) {
    const spin = (amount - orbitStart) / (1 - orbitStart) * Math.PI * 1.75 + Math.PI;
    point[0] = end[0] + Math.cos(spin) * orbitRadius;
    point[1] = path(approach)[1] + Math.sin(spin) * orbitRadius * .70;
    angle = spin + Math.PI / 2;
  }
  ctx.setLineDash([7, 8]);
  stroke(ctx, Array.from({ length: 26 }, (_, i) => path(i / 25)), "#94ade9", 2);
  ctx.setLineDash([]);
  if (target) {
    for (let i = 1; i <= 6; i += 1) {
      const [x, y] = path(i / target);
      ellipse(ctx, x, y, 4, 4, i <= route ? "#ffdd8d" : "#9aafdf");
      ctx.fillStyle = "#fffae8";
      ctx.font = "bold 16px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(i, x, y + (i === target ? 48 : 24));
    }
  }
  planetArt(ctx, end[0], end[1], h * .15, planet.color, orbit ? "#ffebc1" : "");
  if (planet.name) {
    ctx.fillStyle = "#fffae8";
    ctx.font = "bold 19px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(planet.name, end[0], end[1] + h * .35);
  }
  const preview = target && route && amount === 0;
  if (preview) {
    const plannedPath = Array.from({ length: 25 }, (_, i) => path(i / 24 * route / target));
    stroke(ctx, plannedPath, "#ffd78a", 4);
  }
  rocket(ctx, ...point, h / 175, angle, stripe, amount > 0 && amount < 1, dark);
}
