import { useEffect, useMemo, useRef, useState } from "react";
import BlockCard from "../../../ui/components/BlockCard";
import { useScreenCompletion } from "../../../screen/ScreenCompletionContext";

import iconDashboard from "../../../samples/assets/images/icon_dashboard.png";
import iconStudio from "../../../samples/assets/images/icon_studio.png";
import iconTeacher from "../../../samples/assets/images/icon_teacher.png";
import iconLibrary from "../../../samples/assets/images/icon_library.png";
import boyMagnifyingImg from "../../../samples/assets/images/reading_boy_magnifying.png";

const DIRECTIONS = [

    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]

];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const WORD_CONFIGS = {
    DASHBOARD: {
        icon: iconDashboard,
        bg: "#E8F0FE",
        color: "#1A73E8",
        borderColor: "#D2E3FC"
    },
    STUDIO: {
        icon: iconStudio,
        bg: "#FCE8E6",
        color: "#C5221F",
        borderColor: "#FAD2CF"
    },
    TEACHER: {
        icon: iconTeacher,
        bg: "#E6F4EA",
        color: "#137333",
        borderColor: "#CEEAD6"
    }
};

function getWordConfig(word, fallbackIcon) {
    const clean = (word || "").toUpperCase().replace(/[^A-Z]/g, "");
    if (WORD_CONFIGS[clean]) return WORD_CONFIGS[clean];
    return {
        icon: fallbackIcon,
        bg: "#F1F5F9",
        color: "#475569",
        borderColor: "#E2E8F0"
    };
}

function cleanWord(word) {

    return (word || "").toUpperCase().replace(/[^A-Z]/g, "");

}

function buildGrid(words, gridSize) {

    const longest = words.reduce((max, w) => Math.max(max, cleanWord(w).length), 0);

    const size = Math.max(gridSize, longest, 4);

    const grid = Array.from({ length: size }, () => Array(size).fill(null));

    const sorted = [...words].sort((a, b) => cleanWord(b).length - cleanWord(a).length);

    sorted.forEach(word => {

        const letters = cleanWord(word);

        if (!letters) return;

        for (let attempt = 0; attempt < 300; attempt++) {

            const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

            const row = Math.floor(Math.random() * size);

            const col = Math.floor(Math.random() * size);

            const endRow = row + dr * (letters.length - 1);

            const endCol = col + dc * (letters.length - 1);

            if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

            let fits = true;

            const cells = [];

            for (let i = 0; i < letters.length; i++) {

                const r = row + dr * i;

                const c = col + dc * i;

                const existing = grid[r][c];

                if (existing && existing !== letters[i]) {

                    fits = false;

                    break;

                }

                cells.push([r, c]);

            }

            if (!fits) continue;

            cells.forEach(([r, c], i) => { grid[r][c] = letters[i]; });

            break;

        }

    });

    for (let r = 0; r < size; r++) {

        for (let c = 0; c < size; c++) {

            if (!grid[r][c]) {

                grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

            }

        }

    }

    return { grid, size };

}

function computeLine(anchor, target) {

    const dr = Math.sign(target.r - anchor.r);

    const dc = Math.sign(target.c - anchor.c);

    const rowDiff = Math.abs(target.r - anchor.r);

    const colDiff = Math.abs(target.c - anchor.c);

    if (rowDiff === 0 && colDiff === 0) return [anchor];

    if (!(dr === 0 || dc === 0 || rowDiff === colDiff)) return null;

    const len = Math.max(rowDiff, colDiff) + 1;

    const cells = [];

    for (let i = 0; i < len; i++) {

        cells.push({ r: anchor.r + dr * i, c: anchor.c + dc * i });

    }

    return cells;

}

function WordSearchBlock({ block }) {

    const { words = [], gridSize = 8, question } = block.content;

    const completion = useScreenCompletion();

    const { grid, size } = useMemo(() => buildGrid(words, gridSize), [words, gridSize]);

    const [selecting, setSelecting] = useState(false);

    const [anchor, setAnchor] = useState(null);

    const [selectedCells, setSelectedCells] = useState([]);

    const [foundWords, setFoundWords] = useState(() => new Set());

    const [foundCellKeys, setFoundCellKeys] = useState(() => new Set());

    const stateRef = useRef();

    stateRef.current = { selecting, selectedCells, foundWords };

    const allFound = words.length > 0 && foundWords.size === words.length;

    useEffect(() => {

        if (allFound) completion?.reportAnswered(block.id);

    }, [allFound]);

    function cellKey(r, c) {

        return `${r}-${c}`;

    }

    function resolveSelection(cells, currentFound) {

        const letters = cells.map(({ r, c }) => grid[r][c]).join("");

        const reversed = [...letters].reverse().join("");

        return words.find(w => {

            if (currentFound.has(w)) return false;

            const clean = cleanWord(w);

            return clean === letters || clean === reversed;

        }) || null;

    }

    function startSelect(r, c) {

        setSelecting(true);

        setAnchor({ r, c });

        setSelectedCells([{ r, c }]);

    }

    function moveSelect(r, c) {

        if (!stateRef.current.selecting || !anchor) return;

        const line = computeLine(anchor, { r, c });

        if (line) setSelectedCells(line);

    }

    function findCellFromPoint(clientX, clientY) {

        const el = document.elementFromPoint(clientX, clientY);

        if (!el || !el.dataset || el.dataset.row === undefined) return null;

        return { r: Number(el.dataset.row), c: Number(el.dataset.col) };

    }

    useEffect(() => {

        function release() {

            const { selecting, selectedCells, foundWords } = stateRef.current;

            if (!selecting) return;

            setSelecting(false);

            const matchedWord = resolveSelection(selectedCells, foundWords);

            if (matchedWord) {

                setFoundWords(prev => new Set(prev).add(matchedWord));

                setFoundCellKeys(prev => {

                    const next = new Set(prev);

                    selectedCells.forEach(({ r, c }) => next.add(cellKey(r, c)));

                    return next;

                });

            }

            setSelectedCells([]);

            setAnchor(null);

        }

        function handleTouchMove(e) {

            if (!stateRef.current.selecting) return;

            e.preventDefault();

            const touch = e.touches[0];

            const cell = findCellFromPoint(touch.clientX, touch.clientY);

            if (cell) moveSelect(cell.r, cell.c);

        }

        window.addEventListener("mouseup", release);

        window.addEventListener("touchend", release);

        window.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {

            window.removeEventListener("mouseup", release);

            window.removeEventListener("touchend", release);

            window.removeEventListener("touchmove", handleTouchMove);

        };

    }, [anchor]);

    const selectedKeys = new Set(selectedCells.map(({ r, c }) => cellKey(r, c)));

    return (

        <BlockCard type="wordsearch">

            <div className="wordsearch-custom-card-content">
                <div className="wordsearch-custom-interactive">
                    <div className="wordsearch-header">
                        <div className="wordsearch-badge">abc</div>
                        <div className="wordsearch-header-info">
                            <h3 className="wordsearch-header-title">WORD SEARCH</h3>
                            <p className="wordsearch-header-subtitle">
                                {question || "Find the hidden words in the grid."}
                            </p>
                        </div>
                    </div>

                    <div
                        className="wordsearch-grid-container"
                        style={{
                            gridTemplateColumns: `repeat(${size}, 1fr)`,
                            maxWidth: `${size * 48}px`
                        }}
                    >
                        {
                            grid.map((row, rowIndex) =>
                                row.map((cell, colIndex) => {

                                    const key = cellKey(rowIndex, colIndex);

                                    const isFound = foundCellKeys.has(key);

                                    const isSelecting = selectedKeys.has(key);

                                    return (

                                        <div

                                            key={key}

                                            data-row={rowIndex}

                                            data-col={colIndex}

                                            onMouseDown={() => startSelect(rowIndex, colIndex)}

                                            onMouseEnter={() => moveSelect(rowIndex, colIndex)}

                                            onTouchStart={() => startSelect(rowIndex, colIndex)}

                                            className={`wordsearch-grid-cell ${isFound ? "is-matched" : ""} ${isSelecting ? "is-selecting" : ""}`}

                                            style={{ aspectRatio: "1" }}

                                        >

                                            {cell}

                                        </div>

                                    );

                                })

                            )
                        }
                    </div>

                    <div className="wordsearch-pills-row">
                        {
                            words.map(word => {
                                const isFound = foundWords.has(word);
                                const config = getWordConfig(word, iconLibrary);
                                return (
                                    <span
                                        key={word}
                                        className={`wordsearch-pill ${isFound ? "is-found" : ""}`}
                                        style={{
                                            background: config.bg,
                                            color: config.color,
                                            borderColor: config.borderColor,
                                            borderStyle: "solid"
                                        }}
                                    >
                                        <img src={config.icon} className="wordsearch-pill-icon" alt={word} />
                                        {word}
                                    </span>
                                );
                            })
                        }
                    </div>

                    {allFound && (
                        <div className="elab-feedback success" style={{ width: "100%", maxWidth: `${size * 48}px`, boxSizing: "border-box" }}>
                            ✅ All words found!
                        </div>
                    )}
                </div>

                <div className="wordsearch-custom-illustration">
                    <img 
                        src={boyMagnifyingImg} 
                        alt="Word Search Illustration" 
                    />
                </div>
            </div>

        </BlockCard>

    );

}

export default WordSearchBlock;
