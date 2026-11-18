const grid = document.querySelector("#mission-grid");
const dialog = document.querySelector("#mission-dialog");
const body = document.querySelector("#dialog-body");
const finalButton = document.querySelector("#final-button");
const heroButton = document.querySelector("#hero-button");
const storageKey = "byummy-mission-progress-v1";
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const completed = new Set();
const checkpoints = {};
let finalComplete = false;
let session;
let opener;
let frame;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(saved?.missions)) {
    missions.forEach((mission, index) => {
      if (saved.missions.includes(index)) completed.add(index);
      const checkpoint = saved.checkpoints?.[index];
      if (!completed.has(index) && Number.isInteger(checkpoint?.step)
          && checkpoint.step > 0 && checkpoint.step < mission.activities.length) {
        checkpoints[index] = {
          step: checkpoint.step,
          badge: /^#[a-f0-9]{6}$/i.test(checkpoint.badge) ? checkpoint.badge : ""
        };
      }
    });
    finalComplete = saved.final === true && completed.size === missions.length;
  }
} catch {
  // The game can run without storage.
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ missions: [...completed], final: finalComplete, checkpoints }));
  } catch {
    // Progress remains available during this visit.
  }
  showProgress();
}

function showProgress() {
  document.querySelectorAll("[data-count]").forEach(node => {
    node.textContent = `${completed.size} / ${missions.length}`;
  });
  document.querySelector("#progress").value = completed.size;
  document.querySelector(".header-progress").setAttribute("aria-label", `Mission progress, ${completed.size} of ${missions.length} cleared`);
  heroButton.innerHTML = `${completed.size === missions.length ? "Open flight deck" : completed.size || Object.keys(checkpoints).length ? "Continue training" : "Start training"} <span aria-hidden="true">↗</span>`;
  grid.querySelectorAll(".card").forEach((card, index) => {
    const done = completed.has(index);
    const resume = Boolean(checkpoints[index]);
    const verb = done ? "Replay" : resume ? "Resume" : "Start";
    const button = card.querySelector("button");
    button.innerHTML = `${verb} mission <span aria-hidden="true">${done ? "↻" : "→"}</span>`;
    button.setAttribute("aria-label", `${verb} mission for ${missions[index].name}`);
    card.querySelector(".card-status").textContent = done ? "✓ Cleared" : resume
      ? `${checkpoints[index].step} / ${missions[index].activities.length} cleared` : "";
  });
  finalButton.disabled = completed.size < missions.length;
  if (!finalButton.disabled) {
    finalButton.innerHTML = `${finalComplete ? "Fly again" : "Open simulator"} <span aria-hidden="true">↗</span>`;
    document.querySelector("#final-description").textContent = finalComplete
      ? "Both destinations are open. Fly again and handle a different course correction."
      : "Flight deck unlocked. Choose a destination, clear six systems, and steer into orbit.";
  }
}

function openMission(index, button) {
  opener = button;
  const saved = checkpoints[index];
  session = { index, step: saved?.step ?? 0, destination: 0, badge: saved?.badge ?? "", route: {} };
  render();
  dialog.showModal();
  focusHeading();
}

function render() {
  const { index, step, destination } = session;
  const mission = missions[index];
  const isFinal = index === -1;
  dialog.style.setProperty("--theme", mission?.theme ?? "#83ead9");
  document.querySelector("#dialog-label").textContent = isFinal
    ? "BIG ROCKET LAUNCH"
    : `${mission.name.toUpperCase()} / ${mission.planet.toUpperCase()}`;

  if (isFinal && step === 0) {
    body.innerHTML = `
      <h2 id="screen-title" tabindex="-1">Pick your destination</h2>
      <p class="briefing">Your route, science kit, and in-flight correction depend on where you go.</p>
      <div class="destination-grid">
        ${destinations.map((planet, n) => `
          <button class="destination" data-destination="${n}" type="button" aria-pressed="${n === destination}" style="--planet:${planet.color}">
            <span class="planet-dot" aria-hidden="true"></span><span><strong>${planet.name}</strong><small>${planet.detail}</small></span>
          </button>`).join("")}
      </div>
      ${flightMarkup()}
      <div class="dialog-actions"><button class="button blue" id="next" type="button">Start flight checks <span aria-hidden="true">→</span></button></div>`;
    body.querySelectorAll("[data-destination]").forEach(button => {
      button.addEventListener("click", () => {
        session.destination = Number(button.dataset.destination);
        body.querySelectorAll("[data-destination]").forEach(option => {
          option.setAttribute("aria-pressed", option === button);
        });
        previewFlight();
      });
    });
    body.querySelector("#next").addEventListener("click", () => advanceStep());
    previewFlight();
  } else if (isFinal && step === missions.length + 1) {
    const planet = destinations[destination];
    body.innerHTML = `
      <h2 id="screen-title" tabindex="-1">All systems go</h2>
      <p class="briefing">Six systems cleared. You’re headed for ${planet.name}, ${planet.distance} map units away.</p>
      ${flightMarkup()}
      <p class="feedback success" id="feedback" role="status"></p>
      <div class="dialog-actions"><button class="button orange" id="launch" type="button">Begin countdown <span aria-hidden="true">↗</span></button></div>`;
    body.querySelector("#launch").addEventListener("click", () => fly({ isFinal: true, toCorrection: true, button: body.querySelector("#launch") }));
    previewFlight();
  } else if (isFinal && step === missions.length + 2) {
    const planet = destinations[destination];
    renderChallenge(challenge("number", "Correct your course",
      destination === 0
        ? "The rocket has turned 1.25°. It needs a total turn of 2°. Enter the additional turn to reach Aurora’s orbit."
        : "The rocket has turned 1.40°. It needs a total turn of 1.75°. Enter the additional turn to reach Cinder’s orbit.",
      planet.correction, "Subtract the current turn from the required total. Line up the decimal points.",
      "The course correction is set. Fire the steering thrusters to enter orbit.", { unit: "degrees" }),
      "IN-FLIGHT MANEUVER", true, true);
  } else if (isFinal) {
    const subject = missions[step - 1];
    renderChallenge(subject.final[destination] ?? subject.final[0], subject.name, true);
  } else {
    renderChallenge(mission.activities[step], "", false, step === mission.activities.length - 1);
  }
  focusHeading();
}

function flightMarkup() {
  return '<canvas id="flight" class="flight" width="720" height="235" aria-label="Rocket flight map"></canvas>';
}

function advanceStep() {
  session.step++;
  const { index, step, badge } = session;
  if (index >= 0 && !completed.has(index)) {
    checkpoints[index] = { step, badge };
    saveProgress();
  }
  render();
}

function focusHeading() {
  if (!dialog.open) return;
  dialog.scrollTop = 0;
  body.querySelector("#screen-title").focus({ preventScroll: true });
}

function renderChallenge(activity, subject, isFinal, canLaunch) {
  const { kind, title, prompt, answer, hint, takeaway, colors, sources } = activity;
  const { step, index } = session;
  const maneuver = isFinal && canLaunch;
  const current = isFinal ? step : step + 1;
  const total = isFinal ? missions.length : missions[index].activities.length;
  const mode = { number: "Calculate", pick: "Select items", sort: "Build a sequence", match: "Match the pairs", swatch: "Design studio", route: "Flight map" };
  body.innerHTML = `
    ${maneuver ? '<p class="eyebrow step-caption">IN-FLIGHT MANEUVER</p>' : `
      <div class="challenge-header"><span class="eyebrow">${isFinal ? subject : mode[kind]}</span><span>${current} / ${total}</span></div>
      <div class="steps" aria-hidden="true">${Array.from({ length: total }, (_, i) => `<span class="${i < current ? "active" : ""}"></span>`).join("")}</div>`}
    <h2 id="screen-title" tabindex="-1">${title}</h2>
    <form novalidate>
      <fieldset class="challenge-input">
        <legend>${prompt}</legend>
        ${controlMarkup(activity)}
      </fieldset>
      ${kind === "route" || kind === "swatch" || maneuver ? flightMarkup() : ""}
      <p class="feedback" id="feedback" role="status"></p>
      ${sources ? `<div class="activity-sources" hidden>${sources.map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join("")}</div>` : ""}
      <div class="dialog-actions">
        <button class="button quiet" id="hint" type="button">Show hint</button>
        <button class="button blue" type="submit">Check answer <span aria-hidden="true">→</span></button>
      </div>
    </form>`;

  const form = body.querySelector("form");
  const fieldset = form.querySelector("fieldset");
  const feedback = body.querySelector("#feedback");
  const submit = form.querySelector('button[type="submit"]');
  const hintButton = body.querySelector("#hint");
  const choices = setupControls(activity, fieldset);
  let cleared = false;

  function showHint(message) {
    feedback.className = "feedback hint";
    feedback.textContent = message;
  }

  hintButton.addEventListener("click", () => showHint(hint));
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (cleared) {
      if (canLaunch) fly({ isFinal, result: takeaway, button: submit, fromCorrection: maneuver });
      else advanceStep();
      return;
    }
    const response = choices();
    if (response === null) {
      showHint("Finish entering your answer, then check it.");
      return;
    }
    const correct = Array.isArray(answer)
      ? response.length === answer.length && response.every((value, i) => value === answer[i])
      : Math.abs(response - answer) < 1e-8;
    if (!correct) {
      showHint(`Try again. ${hint}`);
      return;
    }
    if (kind === "route") session.route = { target: answer, routeMax: activity.max };
    if (kind === "swatch") session.badge = colors[answer];

    cleared = true;
    fieldset.disabled = true;
    hintButton.hidden = true;
    feedback.className = "feedback success";
    feedback.textContent = `✓ ${takeaway}`;
    const sourceLinks = body.querySelector(".activity-sources");
    if (sourceLinks) sourceLinks.hidden = false;

    if (canLaunch && !body.querySelector("#flight")) {
      feedback.insertAdjacentHTML("beforebegin", flightMarkup());
      previewFlight();
    }
    const label = maneuver ? "Fire steering thrusters" : canLaunch ? `Launch to ${missions[index].planet}` : "Continue";
    submit.innerHTML = `${label} <span aria-hidden="true">→</span>`;
    if (canLaunch) submit.classList.replace("blue", "orange");
    submit.focus({ preventScroll: true });
  });
  if (maneuver) previewFlight({ amount: .59, orbit: true });
}

function controlMarkup({ kind, options, colors, rows, unit, max, massLimit }) {
  switch (kind) {
    case "number":
      return `<label class="number-entry" for="answer">Your answer</label><div class="input-row">
        <input type="text" id="answer" autocomplete="off" spellcheck="false" maxlength="24">
        <span>${unit}</span></div>`;
    case "route":
      return `<div class="route-controls"><label for="route">Trajectory length</label><output for="route" id="route-value">0 segments</output>
        <div class="route-row">
          <button type="button" data-nudge="-0.5" aria-label="Subtract half a segment">−</button>
          <input id="route" type="range" min="0" max="${max}" step="0.5" value="0">
          <button type="button" data-nudge="0.5" aria-label="Add half a segment">+</button>
        </div></div>`;
    case "sort":
      return `<div class="sort-controls"><ol class="sequence" aria-label="Your sequence"></ol>
        <div class="tile-grid">${options.map((option, index) => `<button class="tile" data-piece="${index}" type="button">${option}</button>`).join("")}</div>
        <div class="sort-actions"><button class="button quiet" type="button" id="undo">Undo last</button><button class="button quiet" type="button" id="reset-order">Clear order</button></div></div>`;
    case "match":
      return `<div class="match-grid">${rows.map(row => `<label class="match-row"><span>${row}</span>
        <select><option value="">Choose a match</option>${options.map((option, index) => `<option value="${index}">${option}</option>`).join("")}</select>
        </label>`).join("")}</div>`;
    case "pick":
      return `<div class="tile-grid">${options.map((option, index) => `<label class="tile tile-choice"><input type="checkbox" value="${index}"><span>${option}</span></label>`).join("")}</div>
        ${massLimit ? `<div class="cargo"><div><label for="mass">Payload mass</label><output id="mass-readout">0 / ${massLimit} kg</output></div>
          <progress id="mass" value="0" max="${massLimit}"></progress></div>` : ""}`;
    case "swatch":
      return `<div class="tile-grid swatches">${options.map((option, index) => `<label class="tile tile-choice">
        <input type="radio" name="swatch" value="${index}"><span class="swatch" style="--swatch:${colors[index]}" aria-hidden="true"></span><span>${option}</span>
        </label>`).join("")}</div>`;
  }
}

function setupControls({ kind, answer, max, colors, dark, options, limit, weights, massLimit }, fieldset) {
  switch (kind) {
    case "number":
      return () => readNumber(fieldset.querySelector("input").value);
    case "route": {
      const range = fieldset.querySelector("input");
      function update() {
        fieldset.querySelector("output").textContent = `${range.value} ${range.value === "1" ? "segment" : "segments"}`;
        previewFlight({ route: Number(range.value), target: answer, routeMax: max });
      }
      fieldset.querySelectorAll("[data-nudge]").forEach(button => {
        button.addEventListener("click", () => {
          range.value = Math.min(max, Math.max(0, Number(range.value) + Number(button.dataset.nudge)));
          update();
        });
      });
      range.addEventListener("input", update);
      update();
      return () => Number(range.value);
    }
    case "sort":
      return setupSequence(fieldset, options, answer.length);
    case "match":
      return () => {
        const values = Array.from(fieldset.querySelectorAll("select"), select => select.value);
        return values.includes("") ? null : values.map(Number);
      };
    case "pick": {
      const getChecked = () => Array.from(fieldset.querySelectorAll("input:checked"), input => Number(input.value));
      if (weights) {
        const readout = fieldset.querySelector("#mass-readout");
        const gauge = fieldset.querySelector("#mass");
        fieldset.addEventListener("change", () => {
          const mass = Number(getChecked().reduce((sum, index) => sum + weights[index], 0).toFixed(2));
          gauge.value = mass;
          const over = mass > massLimit;
          readout.textContent = `${mass} / ${massLimit} kg${over ? " · Over limit" : ""}`;
          readout.classList.toggle("over-limit", over);
        });
      }
      return () => {
        const checked = getChecked();
        return checked.length === 0 || (limit && checked.length !== limit) ? null : checked;
      };
    }
    case "swatch":
      fieldset.addEventListener("change", event => previewFlight({ stripe: colors[Number(event.target.value)], dark }));
      previewFlight({ dark });
      return () => {
        const color = fieldset.querySelector("input:checked");
        return color ? Number(color.value) : null;
      };
  }
}

function readNumber(raw) {
  const entry = raw.trim().replace(",", ".");
  if (/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(entry)) return Number(entry);
  const fraction = entry.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction && Number(fraction[2]) > 0) return Number(fraction[1]) / Number(fraction[2]);
  return null;
}

function setupSequence(fieldset, options, length) {
  const order = [];
  const sequence = fieldset.querySelector(".sequence");
  const pieces = Array.from(fieldset.querySelectorAll("[data-piece]"));
  const undo = fieldset.querySelector("#undo");
  const reset = fieldset.querySelector("#reset-order");

  function update() {
    sequence.innerHTML = Array.from({ length }, (_, i) => `
      <li class="${i < order.length ? "filled" : ""}"><span>${i + 1}</span>
        ${i < order.length ? options[order[i]] : "Open slot"}</li>`).join("");
    pieces.forEach((piece, index) => {
      const selected = order.includes(index);
      piece.disabled = selected;
      piece.classList.toggle("used", selected);
    });
    undo.disabled = order.length === 0;
    reset.disabled = order.length === 0;
  }

  pieces.forEach((piece, index) => {
    piece.addEventListener("click", () => {
      order.push(index);
      update();
      (pieces.find(tile => !tile.disabled) ?? body.querySelector('button[type="submit"]')).focus({ preventScroll: true });
    });
  });
  undo.addEventListener("click", () => {
    const index = order.pop();
    update();
    pieces[index]?.focus();
  });
  reset.addEventListener("click", () => {
    order.length = 0;
    update();
    pieces[0].focus();
  });
  update();
  return () => order.length === length ? order : null;
}

function getPlanet() {
  const mission = missions[session.index];
  return mission ? { name: mission.planet, color: mission.color } : destinations[session.destination];
}

function previewFlight(options = {}) {
  paintFlight(body.querySelector("#flight"), getPlanet(), { stripe: session.badge, ...session.route, ...options });
}

function fly({ isFinal, result, button, toCorrection = false, fromCorrection = false }) {
  const active = session;
  const planet = getPlanet();
  const feedback = body.querySelector("#feedback");
  button.disabled = true;
  feedback.className = "feedback success";
  let start;
  let lastLabel = "";
  const countdown = toCorrection ? 2700 : fromCorrection ? 0 : 700;
  const duration = isFinal ? 1500 : 1600;

  function advance(time) {
    if (!dialog.open || active !== session) return;
    start ??= time;
    const elapsed = time - start;
    const progress = Math.max(0, Math.min(1, (elapsed - countdown) / duration));
    const amount = toCorrection ? progress * .59 : fromCorrection ? .59 + progress * .41 : progress;
    const label = elapsed < countdown && toCorrection
      ? `Liftoff in ${Math.ceil((countdown - elapsed) / 900)}…`
      : fromCorrection ? "Entering orbit…" : "Rocket in flight…";
    if (lastLabel !== label) feedback.textContent = label;
    lastLabel = label;
    previewFlight({ amount, orbit: isFinal });
    if (progress < 1 && !motion.matches) {
      frame = requestAnimationFrame(advance);
      return;
    }
    if (toCorrection) {
      advanceStep();
      return;
    }
    if (isFinal) finalComplete = true;
    else {
      completed.add(active.index);
      delete checkpoints[active.index];
    }
    saveProgress();
    body.innerHTML = `
      <div class="success-banner"><span aria-hidden="true">✦</span> ${isFinal ? "FINAL FLIGHT CLEARED" : "MISSION CLEARED"}</div>
      <h2 id="screen-title" tabindex="-1">You reached ${planet.name}!</h2>
      <p class="briefing">${isFinal ? "Your crew passed six systems checks, launched, and corrected its course into orbit." : result}</p>
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
  card.style.setProperty("--planet", mission.color);
  card.innerHTML = `
    <div class="card-art">
      <span class="mission-icon" aria-hidden="true">${mission.icon}</span>
      <span class="number">0${index + 1} / ${mission.planet}</span>
      <canvas width="416" height="228" aria-hidden="true"></canvas>
    </div>
    <div class="card-copy">
      <h3>${mission.name}</h3>
      <p>${mission.action}</p>
      <div class="card-meta"><span>${mission.activities.length} challenges</span><span class="card-status"></span></div>
      <button type="button"></button>
    </div>`;
  const button = card.querySelector("button");
  button.addEventListener("click", () => openMission(index, button));
  paintCard(card.querySelector("canvas"), mission, index);
  grid.append(card);
});
finalButton.addEventListener("click", () => openMission(-1, finalButton));
heroButton.addEventListener("click", () => {
  const next = missions.findIndex((_, index) => !completed.has(index) && checkpoints[index]);
  const index = next >= 0 ? next : missions.findIndex((_, index) => !completed.has(index));
  openMission(index, heroButton);
});
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

function paintFlight(canvas, planet, { amount = 0, route = 0, target = 0, routeMax = 0, stripe = "", orbit = false, dark = false } = {}) {
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  [[.12,.23], [.21,.34], [.38,.21], [.46,.64], [.54,.27], [.66,.8], [.73,.16], [.89,.19], [.94,.53], [.34,.89]].forEach(([x,y], i) => {
    star(ctx, w*x, h*y, i % 3 === 0 ? 6 : 3, i % 3 === 0 ? "#ffe1a4" : "#9db0e8");
  });
  const origin = [w * .11, h * .71];
  const end = target ? [w * (.11 + target / routeMax * .72), h * .43] : [w * .82, h * .46];
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
    for (let i = 1; i <= routeMax; i++) {
      const [x, y] = path(i / target);
      ellipse(ctx, x, y, 4, 4, i <= route ? "#ffdd8d" : "#7d8fbf");
      if (i % 2 === 0 && Math.abs(i - target) > 1) {
        ctx.fillStyle = "#fffae8";
        ctx.font = "bold 16px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(i, x, y + 26);
      }
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
    rocket(ctx, ...path(route / target), .88, .75, stripe, false, dark);
  } else {
    rocket(ctx, ...point, h / 175, angle, stripe, amount > 0 && amount < 1, dark);
  }
}
