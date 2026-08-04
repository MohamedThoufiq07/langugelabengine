/**
 * ============================================================
 * EnglishLab Runtime Engine
 * ------------------------------------------------------------
 * PronunciationService
 *
 * Offline speech-to-text pronunciation feedback.
 *
 * Runs a small (~40MB) Whisper ASR model fully client-side via
 * @xenova/transformers (ONNX Runtime + WASM) — no network calls per
 * attempt. The model itself is fetched from the Hugging Face CDN and
 * cached in the browser (IndexedDB) the first time it's used; every
 * transcription after that runs completely offline.
 *
 * This gives feedback by transcribing what the student said and
 * comparing it to the target word/phrase — a practical proxy for
 * pronunciation quality, not true phoneme-level acoustic scoring
 * (that needs a dedicated pronunciation-assessment model, which has
 * no comparably small offline/WASM option).
 * ============================================================
 */

let transcriberPromise = null;

function getTranscriber(onProgress) {

    if (!transcriberPromise) {

        transcriberPromise = import("@xenova/transformers").then(
            ({ pipeline, env }) => {

                // Only ever load the model from the HF CDN / IndexedDB
                // cache, never look for a local server-hosted copy.
                env.allowLocalModels = false;

                return pipeline(
                    "automatic-speech-recognition",
                    "Xenova/whisper-tiny.en",
                    { progress_callback: onProgress }
                );

            }
        );

    }

    return transcriberPromise;

}

/**
 * Decode a recorded audio Blob (webm/opus from MediaRecorder) into a
 * mono Float32Array PCM buffer at 16kHz — the format Whisper expects.
 */
async function decodeToFloat32Mono16k(blob) {

    const arrayBuffer = await blob.arrayBuffer();

    const AudioCtx = window.AudioContext || window.webkitAudioContext;

    const decodeCtx = new AudioCtx();

    const decoded = await decodeCtx.decodeAudioData(arrayBuffer);

    decodeCtx.close();

    const TARGET_SAMPLE_RATE = 16000;

    const offline = new OfflineAudioContext(

        1,

        Math.ceil(decoded.duration * TARGET_SAMPLE_RATE),

        TARGET_SAMPLE_RATE

    );

    const source = offline.createBufferSource();

    source.buffer = decoded;

    source.connect(offline.destination);

    source.start();

    const resampled = await offline.startRendering();

    return resampled.getChannelData(0);

}

/**
 * Transcribe a recorded audio blob. Returns the recognized text
 * (empty string if nothing was understood).
 */
async function transcribe(blob, onProgress) {

    const [transcriber, audio] = await Promise.all([

        getTranscriber(onProgress),

        decodeToFloat32Mono16k(blob)

    ]);

    const result = await transcriber(audio);

    return (result?.text || "").trim();

}

function normalize(text) {

    return (text || "")

        .toLowerCase()

        .normalize("NFKD")

        .replace(/[^a-z0-9\s]/g, "")

        .replace(/\s+/g, " ")

        .trim();

}

/**
 * Word-level Levenshtein distance, used to score how close the
 * transcript is to the target phrase.
 */
function levenshtein(a, b) {

    const dp = Array.from(

        { length: a.length + 1 },

        (_, i) => [i, ...Array(b.length).fill(0)]

    );

    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {

        for (let j = 1; j <= b.length; j++) {

            dp[i][j] = a[i - 1] === b[j - 1]

                ? dp[i - 1][j - 1]

                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);

        }

    }

    return dp[a.length][b.length];

}

/**
 * Compare a spoken transcript against the target text and produce a
 * simple, kid-friendly feedback verdict.
 */
function scorePronunciation(spokenText, targetText) {

    const spoken = normalize(spokenText);

    const target = normalize(targetText);

    if (!target) {

        return { score: null, verdict: "unscored", heard: spokenText || "" };

    }

    if (!spoken) {

        return { score: 0, verdict: "try_again", heard: "" };

    }

    const distance = levenshtein(spoken, target);

    const score = Math.max(

        0,

        Math.round((1 - distance / Math.max(target.length, 1)) * 100)

    );

    let verdict = "try_again";

    if (score >= 85) verdict = "excellent";

    else if (score >= 60) verdict = "good";

    return { score, verdict, heard: spokenText || "" };

}

export default {

    transcribe,

    scorePronunciation

};
