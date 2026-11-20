---
# =====================================================================
# VORLAGE MIT ALLEN FELDERN
# Kopieren nach _ereignisse/JJJJ-MM-TT-kurzer-titel.md
# Nicht benötigte Felder löschen. Zeilen mit # sind Kommentare.
# =====================================================================
 
# --- typ (Pflicht) ---------------------------------------------------
#   wartung   = geplante Arbeiten
#   stoerung  = ungeplantes Problem
typ: stoerung
 
# --- titel (Pflicht) -------------------------------------------------
#   Kurz und verständlich, ohne Fachbegriffe.
titel: Odoo nicht erreichbar
 
# --- systeme (Pflicht) -----------------------------------------------
#   Welche Systeme betroffen sind. Eine oder mehrere IDs, mit Komma getrennt.
#   rz-ch     Rechenzentrum Schweiz
#   rz-de     Rechenzentrum Deutschland
#   wordpress WordPress-Websites
#   statamic  Statamic-Websites
#   incms     inCMS-Websites
#   odoo      Odoo
#   (Liste und IDs: _data/einstellungen.yml)
systeme: [rz-ch, odoo]
 
# --- start (Pflicht) -------------------------------------------------
#   Format "JJJJ-MM-TT HH:MM", Schweizer Zeit, immer in Anführungszeichen.
#   wartung:  Beginn der Arbeiten (darf in der Zukunft liegen)
#   stoerung: Seit wann das Problem besteht
start: "2026-11-19 15:40"
 
# --- ende (Pflicht bei Wartung, bei Störung erst wenn behoben) -------
#   Format wie start.
#   wartung:  Ende der Arbeiten
#             vor start       -> «Geplant»
#             start bis ende  -> «Läuft gerade»
#             nach ende       -> im Verlauf «Wartung abgeschlossen»
#   stoerung: ""  (leer)      -> Störung läuft, Seite zeigt «Wir sind dran.»
#             Zeit eintragen  -> «Behoben», wandert in den Verlauf
ende: ""
 
# --- schwere (nur bei stoerung) --------------------------------------
#   eingeschraenkt  = langsam oder teilweise gestört (gelb)
#   ausfall         = nicht erreichbar (rot)
#   Ohne Angabe: eingeschraenkt
schwere: ausfall
 
# --- status (optional, nur bei laufender stoerung) -------------------
#   Text im schwarzen Balken der Störung:
#   untersuchung   «Wir schauen uns das an»   (Standard, wenn leer)
#   identifiziert  «Ursache gefunden – wir beheben das Problem»
#   beobachtung    «Behoben – wir beobachten die Lage»
#   Sobald "ende" gesetzt ist, steht automatisch «Behoben».
status: untersuchung
 
# --- updates (optional, nur bei stoerung) ----------------------------
#   Frühere Meldungen, erscheinen als aufklappbarer Verlauf.
#   Neueste zuoberst. Die aktuelle Meldung gehört in den Text unten.
updates:
  - zeit: "2026-11-19 15:40"
    text: "Odoo ist nicht erreichbar. Wir schauen uns das an."
---
Hier steht die aktuelle Information für unsere Kunden (Pflicht).
Einfach und verständlich: Was ist betroffen, was tun wir, müssen Kunden etwas beachten?
Bei einem Update diesen Text ersetzen und die alte Meldung bei Bedarf unter "updates" verschieben.
 
