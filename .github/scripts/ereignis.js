// Erzeugt aus einem Issue (Formular «Störung melden» / «Wartung planen») die Datei
// in _ereignisse/. Die Datei wird bei jedem Ereignis komplett neu aus dem Issue
// und seinen Kommentaren erzeugt. Von Hand muss nichts nachgeführt werden.
//
// Wird von .github/workflows/ereignis-aus-issue.yml mit actions/github-script aufgerufen.

const fs = require("fs");
const path = require("path");

const ORDNER = "_ereignisse";
const EINSTELLUNGEN = "_data/einstellungen.yml";
const STATUS_LABELS = ["identifiziert", "beobachtung"];
const ERLAUBT = ["admin", "maintain", "write"];

// ---------------------------------------------------------------- Hilfsfunktionen

/** Formular-Body («### Feld\n\nWert») in { Feld: Wert } umwandeln. */
function parseBody(body) {
  const out = {};
  const teile = String(body || "").replace(/\r/g, "").split(/^###\s+/m).slice(1);
  for (const t of teile) {
    const nl = t.indexOf("\n");
    const key = (nl < 0 ? t : t.slice(0, nl)).trim();
    let val = nl < 0 ? "" : t.slice(nl + 1).trim();
    if (val === "_No response_") val = "";
    out[key] = val;
  }
  return out;
}

/** ISO-Zeitpunkt -> "JJJJ-MM-TT HH:MM" in Schweizer Zeit. */
function zurich(iso) {
  return new Date(iso)
    .toLocaleString("sv-SE", { timeZone: "Europe/Zurich", hour12: false })
    .slice(0, 16);
}

/** "19.11.2026 15:40", "2026-11-19 15:40" (auch mit T oder 9.30 statt 09:30) -> "2026-11-19 15:40". */
function parseZeit(s, feld) {
  s = String(s || "").trim();
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})[ ,T]+(\d{1,2})[:.](\d{2})$/);
  if (m) return datum(m[3], m[2], m[1], m[4], m[5], feld, s);
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T]+(\d{1,2})[:.](\d{2})$/);
  if (m) return datum(m[1], m[2], m[3], m[4], m[5], feld, s);
  throw new Error(`«${feld}»: «${s}» ist keine gültige Zeit. Bitte so angeben: 19.11.2026 15:40`);
}
function datum(j, mo, t, h, mi, feld, s) {
  const p = (x) => String(x).padStart(2, "0");
  if (+mo < 1 || +mo > 12 || +t < 1 || +t > 31 || +h > 23 || +mi > 59)
    throw new Error(`«${feld}»: «${s}» ist keine gültige Zeit.`);
  return `${j}-${p(mo)}-${p(t)} ${p(h)}:${p(mi)}`;
}

/** Systeme aus _data/einstellungen.yml lesen: { "Odoo": "odoo", ... } */
function ladeSysteme(root) {
  const txt = fs.readFileSync(path.join(root, EINSTELLUNGEN), "utf8");
  const map = {};
  const block = txt.split(/^systeme:\s*$/m)[1] || "";
  for (const eintrag of block.split(/^\s*-\s+(?=id:)/m).slice(1)) {
    const id = (eintrag.match(/^id:\s*(\S+)/) || [])[1];
    const name = (eintrag.match(/^\s*name:\s*(.+?)\s*$/m) || [])[1];
    if (id && name) map[name.replace(/^["']|["']$/g, "")] = id;
  }
  return map;
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 50).replace(/-+$/, "") || "ereignis";
}

const q = (s) => JSON.stringify(String(s)); // JSON-String ist gültiger YAML-String

// ---------------------------------------------------------------- Rendern

/**
 * Baut den Dateiinhalt aus Issue + (bereits gefilterten) Kommentaren.
 * Gibt { typ, datei, inhalt } zurück, null wenn das Issue kein Ereignis-Formular ist,
 * oder { loeschen: true } wenn der Eintrag entfernt werden soll.
 */
function render(issue, kommentare, systemeMap) {
  const f = parseBody(issue.body);
  const typ = "Schwere" in f ? "stoerung" : "Ende" in f ? "wartung" : null;
  if (!typ || !("Betroffene Systeme" in f)) return null;

  if (issue.state === "closed" && issue.state_reason === "not_planned") return { typ, loeschen: true };

  const titel = String(issue.title || "").trim();
  if (!titel) throw new Error("Der Titel fehlt.");

  const namen = f["Betroffene Systeme"].split(",").map((s) => s.trim()).filter(Boolean);
  if (!namen.length) throw new Error("«Betroffene Systeme»: bitte mindestens ein System wählen.");
  const systeme = namen.map((n) => {
    if (!systemeMap[n]) throw new Error(`«Betroffene Systeme»: «${n}» gibt es nicht in ${EINSTELLUNGEN}.`);
    return systemeMap[n];
  });

  const erstellt = zurich(issue.created_at);
  const start = f["Start"] ? parseZeit(f["Start"], "Start") : erstellt;

  let ende = "";
  if (typ === "wartung") {
    ende = parseZeit(f["Ende"], "Ende");
    if (ende <= start) throw new Error("«Ende» muss nach «Start» liegen.");
  } else if (issue.state === "closed") {
    ende = zurich(issue.closed_at);
  }

  // Meldungen: Formulartext + Kommentare. Neueste = aktueller Text, Rest = Verlauf.
  const meldungen = [{ zeit: erstellt, text: f["Information für Kunden"] || "" }]
    .concat(kommentare.map((k) => ({ zeit: zurich(k.created_at), text: String(k.body || "").trim() })))
    .filter((m) => m.text);
  if (!meldungen.length) throw new Error("«Information für Kunden» fehlt.");
  const aktuell = meldungen[meldungen.length - 1];
  const verlauf = meldungen.slice(0, -1).reverse();

  const zeilen = [
    "---",
    `# Automatisch erzeugt aus Issue #${issue.number}. Nicht hier bearbeiten,`,
    `# sondern im Issue: ${issue.html_url}`,
    `issue: ${issue.number}`,
    `typ: ${typ}`,
    `titel: ${q(titel)}`,
    `systeme: [${systeme.join(", ")}]`,
  ];
  if (typ === "stoerung") {
    const schwere = /^ausfall/i.test(f["Schwere"]) ? "ausfall" : "eingeschraenkt";
    zeilen.push(`schwere: ${schwere}`);
  }
  zeilen.push(`start: ${q(start)}`, `ende: ${q(ende)}`);
  if (typ === "stoerung") {
    const labels = (issue.labels || []).map((l) => (typeof l === "string" ? l : l.name));
    const status = STATUS_LABELS.filter((s) => labels.includes(s)).pop();
    if (status) zeilen.push(`status: ${status}`);
  }
  if (verlauf.length) {
    zeilen.push("updates:");
    for (const u of verlauf) zeilen.push(`  - zeit: ${q(u.zeit)}`, `    text: ${q(u.text)}`);
  }
  zeilen.push("---", aktuell.text, "");

  const datei = `${start.slice(0, 10)}-${slug(titel)}-${issue.number}.md`;
  return { typ, datei, inhalt: zeilen.join("\n") };
}

/** Bestehende Datei(en) zu diesem Issue finden (Zeile «issue: N» im Kopf). */
function findeDateien(root, nummer) {
  const dir = path.join(root, ORDNER);
  const re = new RegExp(`^issue:\\s*${nummer}\\s*$`, "m");
  return fs.readdirSync(dir).filter((n) => n.endsWith(".md") && re.test(fs.readFileSync(path.join(dir, n), "utf8")));
}

// ---------------------------------------------------------------- Action

module.exports = async function run({ github, context, core }) {
  const root = process.env.GITHUB_WORKSPACE || process.cwd();
  const { owner, repo } = context.repo;
  const issue = context.payload.issue;
  if (!issue || issue.pull_request) return;

  // Wer darf veröffentlichen? Nur Personen mit Schreibrecht aufs Repo
  // (das Repo ist öffentlich, Issues und Kommentare kann jede:r schreiben).
  const rechte = new Map();
  async function darf(user) {
    if (!user || user.type === "Bot") return false;
    if (!rechte.has(user.login)) {
      let ok = false;
      try {
        const { data } = await github.rest.repos.getCollaboratorPermissionLevel({ owner, repo, username: user.login });
        ok = ERLAUBT.includes(data.permission) || ERLAUBT.includes(data.role_name);
      } catch (e) {
        core.warning(`Rechte von ${user.login} nicht prüfbar: ${e.message}`);
      }
      rechte.set(user.login, ok);
    }
    return rechte.get(user.login);
  }

  const vorhanden = findeDateien(root, issue.number);
  const entferne = () => vorhanden.forEach((n) => fs.unlinkSync(path.join(root, ORDNER, n)));

  if (context.eventName === "issues" && context.payload.action === "deleted") {
    entferne();
    return;
  }

  if (!(await darf(issue.user))) {
    core.info(`Issue #${issue.number} von ${issue.user.login} ohne Schreibrecht: wird nicht veröffentlicht.`);
    return;
  }

  const alle = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number: issue.number, per_page: 100 });
  const kommentare = [];
  for (const k of alle) {
    if (/^\s*intern\s*:/i.test(k.body || "")) continue;
    if (await darf(k.user)) kommentare.push(k);
  }

  const systemeMap = ladeSysteme(root);
  let erg;
  try {
    erg = render(issue, kommentare, systemeMap);
  } catch (e) {
    core.setFailed(e.message);
    await github.rest.issues.createComment({
      owner, repo, issue_number: issue.number,
      body: `⚠️ **Konnte nicht auf der Statusseite veröffentlicht werden:** ${e.message}\n\nBitte das Issue bearbeiten (… → *Edit*), dann wird es erneut versucht.`,
    });
    return;
  }

  if (!erg) {
    core.info(`Issue #${issue.number} ist kein Ereignis-Formular: nichts zu tun.`);
    return;
  }

  entferne();
  if (erg.loeschen) {
    core.info(`Issue #${issue.number} als «not planned» geschlossen: Eintrag entfernt.`);
    return;
  }
  fs.writeFileSync(path.join(root, ORDNER, erg.datei), erg.inhalt);
  core.info(`${ORDNER}/${erg.datei} geschrieben.`);

  if (context.eventName === "issues" && context.payload.action === "opened") {
    await github.rest.issues.createComment({
      owner, repo, issue_number: issue.number,
      body: `✅ Wird in 1–2 Minuten auf der Statusseite angezeigt (\`${ORDNER}/${erg.datei}\`).`,
    });
  }
};

module.exports.render = render;
module.exports.parseBody = parseBody;
module.exports.ladeSysteme = ladeSysteme;
