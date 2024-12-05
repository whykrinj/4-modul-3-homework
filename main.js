// Get elements
const speakButton = document.querySelector("#speak-btn");
const textToRead = document.getElementById("text-to-read");
const speechToTextButton = document.querySelector("#speech-to-text-btn");
const languageSelect = document.querySelector("#language-select");
const pauseButton = document.querySelector("#pause-btn");
const resumeButton = document.querySelector("#resume-btn");
const stopButton = document.querySelector("#stop-btn");
const clearButton = document.querySelector("#clear-btn");
const recordingIndicator = document.querySelector("#recording-indicator");

let utterance = null; // To store the current SpeechSynthesisUtterance instance
let recognition = null; // To store the current SpeechRecognition instance

// Function to convert text to speech
function speakText() {
    const text = textToRead.value;

    if (!text) {
        alert("Please enter some text.");
        return;
    }

    // Create a new utterance instance
    utterance = new SpeechSynthesisUtterance(text);

    // Get selected language and set properties
    const selectedLanguage = languageSelect.value;
    utterance.lang = selectedLanguage;

    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find((voice) => voice.lang === selectedLanguage);

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    } else {
        console.warn("Selected language voice not found. Using default voice.");
    }

    // Configure additional properties
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;

    // Handle events
    utterance.onstart = () => {
        console.log("Speech synthesis started.");
        pauseButton.disabled = false;
        resumeButton.disabled = true;
        stopButton.disabled = false;
    };

    utterance.onend = () => {
        console.log("Speech synthesis ended.");
        pauseButton.disabled = true;
        resumeButton.disabled = true;
        stopButton.disabled = true;
    };

    // Speak the utterance
    speechSynthesis.speak(utterance);
}

// Pause the speech synthesis
function pauseSpeech() {
    if (speechSynthesis.speaking) {
        speechSynthesis.pause();
        console.log("Speech synthesis paused.");
        pauseButton.disabled = true;
        resumeButton.disabled = false;
    }
}

// Resume the speech synthesis
function resumeSpeech() {
    if (speechSynthesis.paused) {
        speechSynthesis.resume();
        console.log("Speech synthesis resumed.");
        pauseButton.disabled = false;
        resumeButton.disabled = true;
    }
}

// Stop the speech synthesis
function stopSpeech() {
    if (speechSynthesis.speaking || speechSynthesis.paused) {
        speechSynthesis.cancel();
        console.log("Speech synthesis stopped.");
        pauseButton.disabled = true;
        resumeButton.disabled = true;
    }
}

// Clear the text area
function clearTextArea() {
    textToRead.value = '';
    console.log("Text area cleared.");
}

// Speech-to-text function
function startSpeechToText() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    const selectedLanguage = languageSelect.value; // Get selected language for STT
    recognition.lang = selectedLanguage; // Set the language (ru-RU, uz-UZ, en-US)
    recognition.interimResults = true; // Allow interim results

    recognition.onstart = () => {
        console.log("Listening for speech...");
        recordingIndicator.textContent = "Recording...";
        recordingIndicator.style.color = "green";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        textToRead.value = transcript; // Display the transcript in the textarea
        console.log("Speech-to-Text Result:", transcript);
    };

    recognition.onerror = (event) => {
        console.error("Speech-to-Text Error:", event.error);
        recordingIndicator.textContent = "Error occurred!";
        recordingIndicator.style.color = "red";
    };

    recognition.onend = () => {
        console.log("Speech-to-Text ended.");
        recordingIndicator.textContent = "Stopped listening.";
        recordingIndicator.style.color = "gray";
    };

    recognition.start(); // Start listening
}

// Load available voices and populate the language dropdown
function loadVoices() {
    const voices = speechSynthesis.getVoices();
    const availableLanguages = new Set(voices.map((voice) => voice.lang));

    // Enable or disable languages based on available voices
    for (let option of languageSelect.options) {
        option.disabled = !availableLanguages.has(option.value);
    }

    console.log("Available voices loaded.");
}

// Add event listeners
speakButton.addEventListener("click", speakText);
speechToTextButton.addEventListener("click", startSpeechToText);
pauseButton.addEventListener("click", pauseSpeech);
resumeButton.addEventListener("click", resumeSpeech);
stopButton.addEventListener("click", stopSpeech);
clearButton.addEventListener("click", clearTextArea);

// Load voices when the page loads and when voices change
window.onload = () => {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
};
