// script.js

// Array mit gültigen Gewinnnummern
const gültigeGewinnnummern = [
    "123456", "234567", "345678", "456789", "567890", "026953", // TEST NUMMERN
	
    "088726", "096892", "111385", "154361", "156058", "223409", 
    "273396", "348189", "355274", "411386", "489652", "525094", 
    "559510", "595141", "693753", "694533", "711740", "748592", 
    "799986", "806023", "882960", "900085", "980423", "983774"
];

// Array mit gültigen Endziffern (letzte 3 Ziffern)
const gültigeEndziffern = [
    "687", "688", "689", "123", "999", // TEST Endziffern
    "073", "177", "291", "391", "447", "533", "611", "701", "848", "970"
];


// Referenz auf HTML-Elemente
const videoElement = document.getElementById('preview');
const canvasElement = document.getElementById('canvas');
const resultElement = document.getElementById('result');
const canvasContext = canvasElement.getContext('2d');
const searchArea = document.querySelector('.search-area'); // Referenz zum Suchbereich (Rahmen)

function setScanState(state) {
    const searchArea = document.querySelector('.search-area');

    // Entfernen aller vorherigen Zustände
    searchArea.classList.remove('valid', 'invalid', 'scanning');
    
    // Hinzufügen des aktuellen Zustands
    if (state === 'valid') {
        searchArea.classList.add('valid');
    } else if (state === 'invalid') {
        searchArea.classList.add('invalid');
    } else if (state === 'scanning') {
        searchArea.classList.add('scanning');
    }
}


// Starten der Kamera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        videoElement.srcObject = stream;

        // Kamera wird geladen
        videoElement.onloadedmetadata = () => {
            videoElement.play();
        };
    } catch (error) {
        console.error('Kamera konnte nicht gestartet werden:', error);
        resultElement.textContent = 'Kamera konnte nicht gestartet werden.';
    }
}

// OCR-Erkennung auf einem Bild
function recognizeTextFromImage() {
    // Setzt den Zustand auf "scanning" (grau), während die Erkennung läuft
    setScanState('scanning');
	
	
	// Definiere den Bereich des Videos, den du extrahieren möchtest (z.B. mittigen Teil des Videos)
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    // Definiere die Größe des Ausschnitts (z.B. 500px breit und 200px hoch)
    const width = 250;  // Breite des Ausschnitts
    const height = 100; // Höhe des Ausschnitts

    // Berechne die mittigen Koordinaten für den Ausschnitt
    const x = (videoWidth - width);  // Horizontal mittig
    const y = (videoHeight - height); // Vertikal mittig

    // Größe des Canvas auf die Videoauflösung setzen (optional: kleinere Auflösung)
    canvasElement.width = width;  // Canvas entspricht der Breite des Ausschnitts
    canvasElement.height = height; // Canvas entspricht der Höhe des Ausschnitts

    // Video-Inhalt in Canvas zeichnen (nur den mittigen Bereich)
    canvasContext.drawImage(videoElement, x, y, width, height, 0, 0, canvasElement.width, canvasElement.height);

	
	
	
	// Größe des Canvas auf die Videoauflösung setzen
    //canvasElement.width = videoElement.videoWidth;
    //canvasElement.height = videoElement.videoHeight;

    // Video-Inhalt in Canvas zeichnen
    //canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // OCR-Erkennung mit Tesseract.js
    Tesseract.recognize(
        canvasElement,
        'deu', // Sprachcode für Deutsch
        {
            logger: (m) => console.log(m) // Loggen von Statusmeldungen
        }
    ).then(({ data: { text } }) => {
        // Den erkannten Text extrahieren
        console.log('Erkannter Text:', text);

        // Auf 6-stellige Gewinnnummer überprüfen
        const match = text.match(/\b\d{6}\b/); // Nur 6-stellige Zahlen extrahieren
        if (match) {
            const gewinnnummer = match[0];
            // Überprüfen, ob die Zahl im Array der gültigen Gewinnnummern oder Endziffern enthalten ist
            if (isValidGewinnnummer(gewinnnummer)) {
                setScanState('valid'); // Zustand auf "valid" (grün) setzen
                resultElement.textContent = `${gewinnnummer} ist einer der 24 Hauptpreise!`;
                resultElement.className = 'valid';
            } else if (isValidEndziffern(gewinnnummer)) {
                setScanState('valid'); // Zustand auf "valid" (grün) setzen
                resultElement.textContent = `...${gewinnnummer.slice(-3)} Serientreffer zu 5€!`;
                resultElement.className = 'valid';
            } else {
                setScanState('invalid'); // Zustand auf "invalid" (rot) setzen
                resultElement.textContent = `${gewinnnummer} ist leider kein Treffer!`;
                resultElement.className = 'invalid';
            }
        } else {
            resultElement.textContent = 'Keine Gewinnnummer erkannt!';
            resultElement.className = 'invalid';
            setScanState('scanning');
        }
    });
}

// Funktion zur Validierung der 6-stelligen Gewinnnummer
function isValidGewinnnummer(gewinnnummer) {
    return gültigeGewinnnummern.includes(gewinnnummer); // Überprüfen, ob die Nummer im Array enthalten ist
}

// Funktion zur Validierung der letzten 3 Ziffern
function isValidEndziffern(gewinnnummer) {
    const letzteDrei = gewinnnummer.slice(-3); // Die letzten drei Ziffern extrahieren
    return gültigeEndziffern.includes(letzteDrei); // Überprüfen, ob diese letzten drei Ziffern gültig sind
}


// Periodisches Aufnehmen und Überprüfen alle 2 Sekunden
setInterval(recognizeTextFromImage, 2500);

// Kamera starten
startCamera();
