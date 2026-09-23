/**
 * ============================================================
 * EnglishLab Runtime Engine
 * ------------------------------------------------------------
 * RecordingService
 *
 * Responsibilities
 * ----------------
 * ✔ Request microphone permission
 * ✔ Start recording
 * ✔ Pause recording
 * ✔ Resume recording
 * ✔ Stop recording
 * ✔ Return recorded audio
 * ✔ Calculate duration
 * ✔ Cleanup resources
 * ============================================================
 */

class RecordingService {

    constructor() {

        this.mediaRecorder = null;
        this.stream = null;
        this.audioChunks = [];

        this.isRecording = false;
        this.isPaused = false;

        this.startTime = null;

    }

    /**
     * --------------------------------------------------------
     * Start Recording
     * --------------------------------------------------------
     */

    async startRecording() {

        if (this.isRecording) {

            throw new Error(
                "Recording already in progress."
            );

        }

        try {

            this.stream =
                await navigator.mediaDevices.getUserMedia({

                    audio: true

                });

        }
        catch {

            throw new Error(
                "Microphone permission denied."
            );

        }

        this.audioChunks = [];
        this.transcript = "";
        this.sttFailed = false;
        this.sttError = null;

        // Web Speech API for real-time speech-to-text transcription
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            try {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = "en-US";
                
                this.recognition.onresult = (event) => {
                    let currentTranscript = "";
                    for (let i = 0; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    this.transcript = currentTranscript.trim();
                };

                this.recognition.onerror = (event) => {
                    if (event.error !== "network" && event.error !== "no-speech" && event.error !== "aborted") {
                        console.warn("Speech recognition error:", event.error);
                    }
                    this.sttFailed = true;
                    this.sttError = event.error;
                };

                this.recognition.start();
            } catch (err) {
                console.warn("Speech recognition initialization failed:", err);
                this.sttFailed = true;
                this.sttError = err.message;
            }
        } else {
            this.sttFailed = true;
        }

        this.mediaRecorder = new MediaRecorder(this.stream);

        this.mediaRecorder.ondataavailable = (event) => {

            if (event.data.size > 0) {

                this.audioChunks.push(event.data);

            }

        };

        this.mediaRecorder.start();

        this.startTime = Date.now();

        this.isRecording = true;
        this.isPaused = false;

    }

    /**
     * --------------------------------------------------------
     * Pause Recording
     * --------------------------------------------------------
     */

    pauseRecording() {

        if (

            this.mediaRecorder &&
            this.isRecording &&
            !this.isPaused

        ) {

            this.mediaRecorder.pause();

            this.isPaused = true;

        }

    }

    /**
     * --------------------------------------------------------
     * Resume Recording
     * --------------------------------------------------------
     */

    resumeRecording() {

        if (

            this.mediaRecorder &&
            this.isRecording &&
            this.isPaused

        ) {

            this.mediaRecorder.resume();

            this.isPaused = false;

        }

    }

    /**
     * --------------------------------------------------------
     * Stop Recording
     * --------------------------------------------------------
     */

    async stopRecording() {

        if (!this.isRecording) {

            throw new Error(
                "Recording has not started."
            );

        }

        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // ignore
            }
        }

        return new Promise((resolve) => {

            this.mediaRecorder.onstop = () => {

                const audioBlob = new Blob(

                    this.audioChunks,

                    {

                        type: "audio/webm"

                    }

                );

                const audioURL =

                    URL.createObjectURL(audioBlob);

                const duration =

                    Date.now() -

                    this.startTime;

                const recordedTranscript = this.transcript || "";
                const sttFailed = this.sttFailed || !recordedTranscript;
                const sttError = this.sttError;

                this.dispose();

                resolve({

                    blob: audioBlob,

                    url: audioURL,

                    transcript: recordedTranscript,

                    duration,

                    sttFailed,

                    sttError

                });

            };

            this.mediaRecorder.stop();

        });

    }

    /**
     * --------------------------------------------------------
     * Dispose Resources
     * --------------------------------------------------------
     */

    dispose() {

        if (this.stream) {

            this.stream

                .getTracks()

                .forEach(track => track.stop());

        }

        this.mediaRecorder = null;

        this.stream = null;

        this.audioChunks = [];

        this.startTime = null;

        this.isRecording = false;

        this.isPaused = false;

    }

    /**
     * --------------------------------------------------------
     * Status
     * --------------------------------------------------------
     */

    isRecordingActive() {

        return this.isRecording;

    }

    isRecordingPaused() {

        return this.isPaused;

    }

}

export default new RecordingService();