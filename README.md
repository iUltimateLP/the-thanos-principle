# The Thanos Principle - ReadMe
---
#### Kompatibilät
Das Spiel wurde getestet und entwickelt auf Windows und Google Chrome. Das Spiel unterstützt ebenfalls den Mac, andere Browser sind allerdings ungetestet, sollten aber aufgrund des universellen Webkits funktionieren.

#### Start
##### Lokal
Das Spiel kann lokal gestartet werden, in dem wahlweise ```intro.html``` (für das komplette Spielerlebnis mit Intro) oder ```index.html``` (für das Spiel ohne Intro) im Browser (am Besten Google Chrome) geöffnet wird.
**Info:** da Audiodateien über Requests geladen werden, Lokalzugriff aber unter Google Chrome standardmäßig blockiert wird, muss Chrome mittels 
```
chrome.exe --allow-file-access-from-files
```
gestartet werden, um Audio zu unterstützen.

##### Server
Das Spiel kann über einen simplen Web-Server ausgeführt werden, dazu muss dieser einfach auf das Spiel-Root-Verzeichnis gelegt werden. Auch hier wieder: ```intro.html``` für Spiel mit Intro, ```index.html``` für das Spiel ohne Intro.
Es steht außerdem ein Server zur Verfügung, auf dem das Spiel bereits läuft: [thanos.jverbeek.de](http://thanos.jverbeek.de)

---
David Bollmann - 5042634
Jonathan Verbeek - 5058288
