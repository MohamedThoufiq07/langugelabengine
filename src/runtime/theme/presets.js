export const THEME_PRESETS = {

    default: {
        label: "Classic Blue",
        swatch: "#2563EB",
        vars: {
            "--primary": "#2563EB",
            "--shell-gradient": "linear-gradient(135deg, #EEF4FF 0%, #F8FBFF 50%, #FFFDF8 100%)",
            "--shell-blob-a": "#DCEBFF",
            "--shell-blob-b": "#FFE8B8"
        }
    },

    sunrise: {
        label: "Sunrise",
        swatch: "#F97316",
        vars: {
            "--primary": "#F97316",
            "--shell-gradient": "linear-gradient(135deg, #FFF1E6 0%, #FFF7ED 50%, #FFF0F3 100%)",
            "--shell-blob-a": "#FFD9B3",
            "--shell-blob-b": "#FFC9D9"
        }
    },

    ocean: {
        label: "Ocean",
        swatch: "#0891B2",
        vars: {
            "--primary": "#0891B2",
            "--shell-gradient": "linear-gradient(135deg, #E0F7FA 0%, #F0FBFF 50%, #F5FBFF 100%)",
            "--shell-blob-a": "#BAE6FD",
            "--shell-blob-b": "#A5F3FC"
        }
    },

    mint: {
        label: "Mint",
        swatch: "#16A34A",
        vars: {
            "--primary": "#16A34A",
            "--shell-gradient": "linear-gradient(135deg, #ECFDF5 0%, #F3FDF7 50%, #FDFFF5 100%)",
            "--shell-blob-a": "#BBF7D0",
            "--shell-blob-b": "#D9F99D"
        }
    },

    grape: {
        label: "Grape",
        swatch: "#9333EA",
        vars: {
            "--primary": "#9333EA",
            "--shell-gradient": "linear-gradient(135deg, #F5F0FF 0%, #FAF5FF 50%, #FFF0FA 100%)",
            "--shell-blob-a": "#E9D5FF",
            "--shell-blob-b": "#FBCFE8"
        }
    },

    rose: {
        label: "Rose",
        swatch: "#E11D48",
        vars: {
            "--primary": "#E11D48",
            "--shell-gradient": "linear-gradient(135deg, #FFF1F2 0%, #FFF5F6 50%, #FFF8F0 100%)",
            "--shell-blob-a": "#FECDD3",
            "--shell-blob-b": "#FDE68A"
        }
    },

    amber: {
        label: "Amber",
        swatch: "#D97706",
        vars: {
            "--primary": "#D97706",
            "--shell-gradient": "linear-gradient(135deg, #FFFBEB 0%, #FFFDF5 50%, #FFF7ED 100%)",
            "--shell-blob-a": "#FDE68A",
            "--shell-blob-b": "#FED7AA"
        }
    },

    sky: {
        label: "Sky",
        swatch: "#0284C7",
        vars: {
            "--primary": "#0284C7",
            "--shell-gradient": "linear-gradient(135deg, #F0F9FF 0%, #F5FBFF 50%, #F8FCFF 100%)",
            "--shell-blob-a": "#BAE6FD",
            "--shell-blob-b": "#C7D2FE"
        }
    }

};

export function resolveTheme(themeKey) {

    return THEME_PRESETS[themeKey] || THEME_PRESETS.default;

}

const THEME_KEYS = Object.keys(THEME_PRESETS);

/**
 * Deterministically assigns one of the hardcoded THEME_PRESETS to a screen,
 * so every screen reads as visually distinct without requiring a "theme"
 * field to be authored on the screen (no experience/schema changes needed).
 * Stable across re-renders (same screen always gets the same theme) and
 * varies from screen to screen.
 */
export function pickThemeForScreen(screen, fallbackSeed) {

    const seed = String(screen?.id ?? fallbackSeed ?? "0");

    let hash = 0;

    for (let i = 0; i < seed.length; i++) {

        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;

    }

    const key = THEME_KEYS[hash % THEME_KEYS.length];

    return THEME_PRESETS[key];

}

/**
 * Maps an experience's "grade" text (e.g. "Grade 3", "Grade K", "Grade 10")
 * to a coarse age band. Used to scale how playful/decorated the runtime
 * shell looks — younger grades get the full mascot + floating decorations,
 * older grades get a calmer, more grown-up presentation. Reads the existing
 * `grade` field already authored in the CMS; no schema changes.
 */
export function parseGradeBand(gradeText) {

    const text = String(gradeText || "").toLowerCase();

    if (/\bk\b|pre-?k|kindergarten/.test(text)) return "early";

    const match = text.match(/\d+/);

    const num = match ? parseInt(match[0], 10) : null;

    if (num === null) return "mid";

    if (num <= 2) return "early";

    if (num <= 5) return "mid";

    if (num <= 8) return "upper";

    return "teen";

}

export default THEME_PRESETS;
