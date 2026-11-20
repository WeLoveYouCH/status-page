# WeLoveYou Statusseite

Statische Statusseite für unsere Kunden auf **status.weloveyou.systems**, gehostet mit GitHub Pages.

## Ereignis erfassen per Issue (empfohlen)

Auf GitHub **Issues → New issue** und **Störung melden** oder **Wartung planen** wählen, das Formular ausfüllen und absenden.
Eine Action schreibt daraus die Datei in `_ereignisse/`. Nach 1–2 Minuten ist die Seite aktualisiert.

| Was | Wie im Issue |
|---|---|
| Update / neue Meldung | Kommentar schreiben. Der neueste Kommentar ist der aktuelle Text, ältere erscheinen im Verlauf. |
| Korrektur (Titel, Systeme, Zeiten, Text) | Issue bearbeiten (… → *Edit*) bzw. Kommentar bearbeiten. |
| Status-Balken einer Störung | Label `identifiziert` oder `beobachtung` setzen (ohne Label: «Wir schauen uns das an»). |
| Störung behoben | Kommentar «Behoben, Ursache war …» schreiben, dann **Close as completed**. Zeitpunkt des Schliessens = Ende. |
| Fehlalarm / Wartung abgesagt | **Close as not planned**: Der Eintrag verschwindet von der Seite. |
| Nicht veröffentlichen | Kommentar mit `intern:` beginnen. |

- Veröffentlicht werden nur Issues und Kommentare von Personen mit **Schreibrecht** aufs Repo. Das Repo ist öffentlich: Kommentare von Fremden erscheinen nicht auf der Seite, und Issues von Fremden schliesst und sperrt die Action automatisch (mit Hinweis auf die Support-E-Mail aus `_data/einstellungen.yml`).
- Zeiten im Format `19.11.2026 15:40` (Schweizer Zeit). Bei Fehlern kommentiert die Action im Issue, was nicht stimmt.
- Die erzeugten Dateien nicht von Hand ändern. Sie werden bei jeder Änderung am Issue neu geschrieben.
- Neue Systeme: in `_data/einstellungen.yml` **und** in den beiden Formularen unter `.github/ISSUE_TEMPLATE/` eintragen (gleicher `name`).
- Einmalig die Labels anlegen (Issues → Labels): `stoerung`, `wartung`, `identifiziert`, `beobachtung`.
- Settings → Actions → General → Workflow permissions: **Read and write permissions** muss erlaubt sein.

## Ereignis erfassen von Hand

Jede Wartung und jede Störung ist **eine eigene Datei** im Ordner `_ereignisse/`.
Dateiname am besten `JJJJ-MM-TT-kurzer-titel.md`, z.B. `2026-12-10-odoo-update.md`.

Auf GitHub im Ordner `_ereignisse` → **Add file → Create new file**,
Inhalt aus `vorlagen/` kopieren, anpassen, **Commit changes**. Nach 1–2 Minuten ist die Seite aktualisiert.

### Wartung

```markdown
---
typ: wartung
titel: Sicherheitsupdates Odoo-Server
systeme: [odoo]
start: "2026-11-26 22:00"
ende: "2026-11-26 23:30"
---
Odoo ist in diesem Zeitraum für einige Minuten nicht erreichbar.
```

Vor dem Start erscheint sie unter «Geplante Wartungsarbeiten», zwischen Start und Ende als «Läuft gerade», danach im Verlauf. Das passiert automatisch, es muss nichts mehr angepasst werden.

### Störung

```markdown
---
typ: stoerung
titel: Odoo nicht erreichbar
systeme: [odoo]
schwere: ausfall
start: "2026-11-19 15:40"
ende: ""
---
Odoo ist im Moment nicht erreichbar. Wir sind dran.
```

- **Solange `ende` leer ist**, steht die Störung zuoberst und die Seite zeigt «Wir sind dran.».
- **Update:** Text unter den `---` anpassen.
- **Behoben:** `ende` eintragen und Text anpassen («Behoben, Ursache war …»). Die Störung wandert in den Verlauf.

| Feld | Werte |
|---|---|
| `typ` | `wartung` oder `stoerung` |
| `systeme` | IDs aus `_data/einstellungen.yml`, z.B. `[rz-ch, wordpress]` |
| `schwere` | `eingeschraenkt` oder `ausfall` (nur bei Störungen) |
| `start`, `ende` | `"JJJJ-MM-TT HH:MM"` in Schweizer Zeit, **in Anführungszeichen** |
| `status` | optional, nur bei laufender Störung: `untersuchung` (Standard), `identifiziert`, `beobachtung` |
| `updates` | optional, frühere Meldungen als Verlauf (siehe `_ereignisse/2026-11-12-websites-langsam.md`) |

Alte Ereignisse einfach liegen lassen. Die Seite zeigt nur die letzten 90 Tage.

## Hinweis-Banner, Systeme, Kontakt

In `_data/einstellungen.yml`:
- `hinweis.aktiv: true/false` schaltet das Banner zuoberst ein oder aus.
- `systeme` legt fest, welche Rechenzentren und Hostings angezeigt werden. Neue Systeme auch in den Issue-Formularen (`.github/ISSUE_TEMPLATE/`) mit gleichem `name` eintragen.

## Vorschau

`?demo=wartung`, `?demo=stoerung` oder `?demo=ausfall` an die URL anhängen, um eine laufende Wartung bzw. Beispiel-Störung zu sehen
(wird nur im Browser eingeblendet, nicht gespeichert).

## Einrichtung (einmalig)

1. Repo auf GitHub anlegen (öffentlich, für Pages im Free-Plan nötig) und Inhalt pushen.
2. Settings → Pages → Source: **Deploy from a branch**, Branch `master`, Ordner `/ (root)`.
3. Custom domain `status.weloveyou.systems` (steht schon in `CNAME`), danach **Enforce HTTPS** aktivieren.
4. DNS: `status.weloveyou.systems. CNAME <org>.github.io.`
5. Org Settings → Pages → **Verified domains**: `weloveyou.systems` verifizieren (Schutz vor Domain-Übernahme).

GitHub Pages baut die Seite mit Jekyll automatisch. Es braucht keine eigene Action.

## Lokal testen (optional)

```bash
docker run --rm -v "$PWD":/srv/jekyll -p 4000:4000 jekyll/jekyll jekyll serve
```
Dann http://localhost:4000 öffnen. `index.html` direkt im Browser öffnen funktioniert nicht,
weil die Daten erst beim Build eingesetzt werden.

## Schriften

Afacad Flux (variable Schrift, SIL Open Font License) liegt in `fonts/` und wird nicht von Google geladen.
