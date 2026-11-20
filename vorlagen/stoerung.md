---
# =====================================================================
# VORLAGE STÖRUNG
# Kopieren nach _ereignisse/JJJJ-MM-TT-kurzer-titel.md
# Zeilen mit # sind Kommentare und können stehen bleiben.
#
# Ablauf: erfassen mit ende "" -> bei Updates den Text unten anpassen
#         -> wenn gelöst: ende eintragen und Text anpassen.
# =====================================================================

typ: stoerung

# Kurz beschreiben, was nicht geht, ohne Fachbegriffe.
titel: Odoo nicht erreichbar

# Betroffene Systeme, eine oder mehrere IDs mit Komma getrennt:
#   rz-ch     Rechenzentrum Schweiz
#   rz-de     Rechenzentrum Deutschland
#   wordpress WordPress-Websites
#   statamic  Statamic-Websites
#   incms     inCMS-Websites
#   odoo      Odoo
systeme: [odoo]

#   eingeschraenkt  = langsam oder teilweise gestört (gelb)
#   ausfall         = nicht erreichbar (rot)
schwere: ausfall

# Seit wann das Problem besteht.
# Format "JJJJ-MM-TT HH:MM", Schweizer Zeit, immer in Anführungszeichen.
start: "2026-12-10 09:15"

#   ""              -> Störung läuft, Seite zeigt «Wir sind dran.»
#   Zeit eintragen  -> «Behoben», wandert in den Verlauf
ende: ""

# Optional, Text im schwarzen Balken, solange die Störung läuft:
#   untersuchung   «Wir schauen uns das an»   (Standard)
#   identifiziert  «Ursache gefunden – wir beheben das Problem»
#   beobachtung    «Behoben – wir beobachten die Lage»
status: untersuchung

# Optional: frühere Meldungen als aufklappbarer Verlauf, neueste zuoberst.
# Ganzen Block löschen, wenn nicht gebraucht.
updates:
  - zeit: "2026-12-10 09:15"
    text: "Odoo ist nicht erreichbar. Wir schauen uns das an."
---
Aktuelle Info für unsere Kunden: Was ist betroffen, was tun wir, müssen Kunden etwas beachten?
