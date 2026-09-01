# Datenmethodik

## Zweck und Umfang

openings.dev macht öffentliche Tech-Stellen aus von Communities gepflegten GitHub-Repositories leichter auffindbar. Der Dienst indexiert und ordnet öffentliche Ausschreibungen; er ist weder Arbeitgeber noch Vermittler oder Eigentümer der Stellen.

## Geeignete Quellen

Eine Quelle muss ein öffentliches Repository sein, dessen Issues bewusst für Stellen genutzt werden. Jede Quelle wird vor der Aufnahme geprüft. Verwendet sie Job-Labels, werden nur konfigurierte Labels erfasst; ein reines Job-Board kann ohne Labels erfasst werden. Aufnahme bedeutet keine Empfehlung.

## Synchronisierungsrhythmus und Issue-Status

Die geplante Pipeline versucht alle drei Stunden zu synchronisieren. Offene Issues werden Kandidaten für den Snapshot; geschlossene werden nach einem erfolgreichen Lauf entfernt. `/status` veröffentlicht letzte erfolgreiche Synchronisierung, offene Stellen, letzten Beitrag und eine 30-Tage-Zusammenfassung ohne rohe Fehler. GitHub-Verfügbarkeit und Limits können Aktualisierungen verzögern.

## Geografie

Quellen- und Jobgeografie sind getrennt. Das Land der Community belegt nicht den Arbeitsort. Land, Stadt, Region, Arbeitsmodell und Remote-Einschränkungen stammen aus expliziten Feldern oder vorsichtigen Ableitungen. Ohne ausreichende Belege bleibt der Wert unbekannt. „Remote“ bedeutet nicht automatisch weltweit.

## Taxonomie

GitHub-Labels bleiben Quell-Tags, werden aber nicht pauschal Jobkategorien. Kuratierte Regeln ordnen Bereiche, Technologien, Erfahrungsniveau, Beschäftigungsart, Arbeitsmodell und Sprachen zu. Operative Moderations- oder Status-Labels sind ausgeschlossen.

## Gruppierung von Duplikaten

Ausschreibungen werden nur bei starken gemeinsamen Belegen gruppiert, etwa derselben konkreten Bewerbungs-URL oder stabilen normalisierten Signalen. Allgemeine Firmenwebseiten, Karriereindizes, Artikel und Dokumentation reichen nicht. Eine kanonische Stelle zeigt alle Quellenlinks. Heuristiken können Grenzfälle weiter übersehen oder falsch gruppieren.

## Aktualität

Das Alter wird aus der ursprünglichen Veröffentlichung beim Snapshot berechnet. Bis 30 Tage gilt `fresh`, 31 bis 90 `aging`, danach `stale`. Filter für 7, 30 und 90 Tage nutzen denselben Zeitpunkt. Ein neues Datum garantiert keine offene Bewerbung.

## Feldherkunft

Standort, Gehalt, Erfahrungsniveau und Arbeitsmodell heißen `declared`, `inferred` oder `unknown`. `declared` steht explizit in der Quelle; `inferred` wurde deterministisch abgeleitet; `unknown` bedeutet unzureichende Belege. Gruppierte Stellen behalten den stärksten Beleg und alle Links.

## Gesponserte Stellen

Gesponserte Stellen kommen nur aus der dafür vorgesehenen strukturierten Quelle und sind klar gekennzeichnet. Sie können vor organischen Ergebnissen stehen, werden aber nie als organisch dargestellt oder still beigemischt. Sponsoring garantiert weder Qualität noch Verfügbarkeit oder Verhalten.

## Korrekturen und Support

Melde geschlossene oder doppelte Stellen, falsche Orte, unangemessene Inhalte, Korrekturen oder Entfernungen über die Meldefunktion oder support@openings.dev. Die Meldung erzeugt eine Support-Nachricht und ändert die Quelle nicht automatisch. Vor Korrekturen an Katalog, Parser oder Quelle prüfen wir das Original.

## Datenschutz und Beobachtbarkeit

Sentry erhält bereinigte technische Fehler ohne standardmäßige Personendaten, Replay, rohe Header oder rohe Pipeline-Meldungen. Mixpanel lädt nur nach ausdrücklicher Einwilligung und erhält wenige erlaubte Ereignisse. Wir sammeln keine automatische Erfassung, Aufzeichnungen, rohe Suchtexte, E-Mails, vollständigen URLs oder Werbeprofile. Einstellungen und gespeicherte Stellen bleiben lokal.

## Grenzen und Autorität

Öffentliche Daten können unvollständig, alt, widersprüchlich oder nicht verfügbar sein. Parsing, Übersetzung, Gehaltsdeutung und Gruppierung sind deterministisch, aber unvollkommen. openings.dev prüft weder Arbeitgeber, Bedingungen, Berechtigung noch Ergebnisse. Das ursprüngliche GitHub-Issue ist maßgeblich für aktuelle Details und Bewerbungsanweisungen; prüfe es vor Entscheidungen.
