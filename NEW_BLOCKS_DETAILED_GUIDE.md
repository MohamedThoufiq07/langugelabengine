# Newly Created Blocks - Location & Modifications

**Date:** August 18, 2026  
**Status:** All new blocks implemented and integrated with the rendering engine

---

## 1. YouAskBlock - Speaking Module

### Location
```
src/runtime/rendering/blocks/speaking/YouAskBlock.jsx
```

### What It Does
Students generate and record their own questions (Speaking Production skill)

### How It's Modified/Unique
Unlike existing speaking blocks (DialogueBlock, VoiceRecorderBlock), YouAskBlock combines:
- **Text Input** - Students type their question
- **Voice Recording** - Students record the question using microphone
- **Audio Playback** - Ability to replay what was recorded
- **Dual Submission** - Both text and audio are captured and saved

### Key Features
```javascript
Block Content Structure:
{
  prompt: "Ask a question about the topic",
  recordingRequired: true,
  maxDuration: 60000  // milliseconds
}

Answer Saved As:
{
  question: "User typed question",
  recordingUrl: "blob:...",
  recordingDuration: 45000,
  timestamp: 1692374400000
}
```

### Completion Tracking
- Uses `completion?.reportAnswered(block.id)`
- Answers saved via `completion?.saveAnswer(block.id, data)`
- Block gates screen progression until answered

### File Size
~250 lines of React component code

---

## 2. HotspotExplorerBlock - Reading Module

### Location
```
src/runtime/rendering/blocks/reading/HotspotExplorerBlock.jsx
```

### What It Does
Interactive image exploration with clickable hotspots (Reading Comprehension skill)

### How It's Modified/Unique
Different from ImageBlock and ReadingBlock because it:
- **Interactive Regions** - Define clickable areas on an image with coordinates
- **Progressive Discovery** - Track which hotspots have been clicked
- **Information Reveal** - Show context/information only after clicking a hotspot
- **Completion Gating** - Screen doesn't progress until ALL hotspots discovered
- **Hints System** - Optional hints to guide students to hotspots

### Key Features
```javascript
Block Content Structure:
{
  imageUrl: "path/to/image.png",
  hotspots: [
    {
      id: "hotspot_1",
      name: "Building",
      x: 150,          // pixel position
      y: 200,
      width: 100,      // size
      height: 80,
      info: "This is an old building...",
      hint: "Click on the structure on the left"
    },
    // ... more hotspots
  ]
}

Answer Saved As:
{
  discoveredHotspots: ["hotspot_1", "hotspot_2"],
  discoveryOrder: ["hotspot_2", "hotspot_1"],
  totalClicks: 5,
  timeSpent: 125000  // milliseconds
}
```

### Completion Tracking
- Blocks screen progression until ALL hotspots discovered
- Added to GATING_TYPES in ScreenRenderer.jsx
- Saves discovery progress and order

### Visual Feedback
- Hotspot highlights on hover
- Visual indicator showing discovery progress (e.g., "3/5 discovered")
- Explored hotspots marked as complete

### File Size
~300 lines of React component code

---

## 3. FunctionalReadingBlock - Reading Module

### Location
```
src/runtime/rendering/blocks/reading/FunctionalReadingBlock.jsx
```

### What It Does
Real-world document analysis with multiple question types (Reading Comprehension)

### How It's Modified/Unique
More complex than ReadingBlock and QuizBlock combined because it:
- **Document Display** - Shows forms, contracts, receipts, or other real documents
- **Multiple Question Types** - Within ONE block: MCQ, text input, true/false
- **Progressive Questions** - Questions can reference earlier answers
- **Answer Validation** - Different validation logic per question type
- **Scenario Context** - Real-world tasks (e.g., "Fill out this form" or "Find information")

### Key Features
```javascript
Block Content Structure:
{
  documentUrl: "path/to/document.pdf",
  documentType: "form",  // or "receipt", "contract", "article"
  scenario: "Complete this bank form using the information provided",
  questions: [
    {
      id: "q1",
      type: "mcq",
      question: "What is the account type?",
      options: ["Savings", "Checking", "Investment"],
      correctAnswer: 1
    },
    {
      id: "q2",
      type: "text",
      question: "Enter the account number",
      expectedAnswer: "ACC-12345"
    },
    {
      id: "q3",
      type: "true_false",
      question: "Is the opening balance more than $500?",
      correctAnswer: true
    }
  ]
}

Answer Saved As:
{
  q1: { type: "mcq", answer: 1, correct: true },
  q2: { type: "text", answer: "ACC-12345", correct: true },
  q3: { type: "true_false", answer: true, correct: true },
  totalScore: 3,
  timeSpent: 245000
}
```

### Completion Tracking
- All questions must be answered correctly
- Added to GATING_TYPES in ScreenRenderer.jsx
- Each question tracks individual correctness

### Validation Logic
- MCQ: Simple index matching
- Text: Fuzzy string matching or exact match based on config
- True/False: Boolean comparison

### File Size
~400 lines of React component code

---

## 4. AudioMysteryBlock - Listening Module

### Location
```
src/runtime/rendering/blocks/listening/AudioMysteryBlock.jsx
```

### What It Does
Progressive listening with audio clues and 4-attempt system (Listening Comprehension)

### How It's Modified/Unique
Different from AudioBlock and DictationBlock because it:
- **Progressive Clues** - Audio clues get progressively longer/clearer with each attempt
- **Attempt Limiting** - Students get 4 attempts maximum
- **Hint Ladder System** - On wrong answers: Replay → Visual Clue → Sentence Starter → Model Answer
- **Adaptive Difficulty** - Clue changes based on attempt number
- **Mystery Element** - Question may be hidden until after wrong attempts

### Key Features
```javascript
Block Content Structure:
{
  clues: [
    {
      audio: "path/to/clue_1.mp3",
      duration: 5000,
      description: "Very short initial audio"
    },
    {
      audio: "path/to/clue_2.mp3",
      duration: 10000,
      description: "Longer audio with more context"
    },
    {
      audio: "path/to/clue_3.mp3",
      duration: 20000,
      description: "Full audio with clear answer"
    },
    {
      audio: "path/to/clue_4.mp3",
      duration: 30000,
      description: "Complete audio with explanation"
    }
  ],
  question: "What is being described?",
  options: ["Option A", "Option B", "Option C"],
  correctAnswer: 0,
  hints: {
    replay: "Listen to the audio again carefully",
    visualClue: "Think about which option matches the sounds",
    sentenceStarter: "The answer sounds like...",
    modelAnswer: "The correct answer is Option A"
  }
}

Answer Saved As:
{
  selectedIndex: 0,
  attemptsUsed: 3,
  correctOnAttempt: 3,
  hintsUsed: 2,
  cluesUsed: [1, 2, 3],
  audioPlayTime: [0, 2000, 5000, 8000]
}
```

### Completion Tracking
- Added to GATING_TYPES in ScreenRenderer.jsx
- Completion when correct answer selected
- Tracks attempt number and hints used

### HintLadder Integration
- Uses HintLadder.jsx component
- 4-stage system: Replay → Visual Clue → Sentence Starter → Model Answer
- Shown only on wrong attempts

### File Size
~350 lines of React component code

---

## 5. RoleplaySimulationBlock - Speaking Module

### Location
```
src/runtime/rendering/blocks/speaking/RoleplaySimulationBlock.jsx
```

### What It Does
Turn-by-turn conversational roleplay scenarios (Speaking Production)

### How It's Modified/Unique
Different from DialogueBlock and RolePlayBlock because it:
- **Multi-Turn Conversation** - NPC speaks, student responds, NPC reacts (repeating)
- **Student Voice Recording** - Each student response is voice recorded
- **Scenario Context** - Background/objectives for the roleplay
- **Dynamic NPC Behavior** - NPC responses can adapt based on student answers
- **Completion Criteria** - Conversation flow with success conditions
- **Time Management** - Track and limit conversation duration

### Key Features
```javascript
Block Content Structure:
{
  scenario: "You are at a restaurant ordering food",
  objectives: [
    "Greet the waiter",
    "Order a main course",
    "Ask about desserts",
    "Request the bill"
  ],
  npcCharacter: "Waiter",
  npcImage: "path/to/waiter.png",
  conversation: [
    {
      turn: 1,
      speaker: "npc",
      audio: "path/to/npc_greeting.mp3",
      text: "Good evening! Welcome to our restaurant. What can I help you with?",
      expectedStudentResponses: [
        { text: "I'd like to order", hint: "Start with your intention" },
        { text: "I'd like a table for two", hint: "Specify your needs" }
      ]
    },
    {
      turn: 2,
      speaker: "student",
      recordingRequired: true,
      prompt: "Respond to the waiter"
    },
    {
      turn: 3,
      speaker: "npc",
      audio: "path/to/npc_response.mp3",
      text: "Wonderful! Here is our menu..."
    },
    // ... more turns
  ]
}

Answer Saved As:
{
  studentResponses: [
    {
      turn: 2,
      recordingUrl: "blob:...",
      recordingDuration: 8000,
      transcript: "I'd like to order, please"
    }
  ],
  conversationComplete: true,
  objectivesAchieved: ["greet", "order", "dessert"],
  totalTime: 180000  // milliseconds
}
```

### Completion Tracking
- Added to GATING_TYPES in ScreenRenderer.jsx
- Completion when all turns completed
- Tracks each student response separately

### Speech Recognition (Optional)
- Can integrate speech-to-text for transcript
- Stored in answer data for review

### File Size
~450 lines of React component code

---

## Enhanced Blocks Summary

### QuizBlock (Enhanced)

**Location:** `src/runtime/rendering/blocks/reading/QuizBlock.jsx`

**New Properties Added:**
```javascript
{
  question: "Question text",
  options: ["Option 1", "Option 2"],
  correctAnswerIndex: 0,
  audio: "path/to/question_audio.mp3",      // NEW
  audioFirst: false                         // NEW
}
```

**How It Was Modified:**
- Added optional audio playback before options appear
- `audioFirst` toggle requires audio to play before interaction
- Tracks audio play state in saved answers
- Confetti animation on correct answer (unchanged)

**Backward Compatible:** Yes - audio is optional

---

### VoiceRecorderBlock (Enhanced)

**Location:** `src/runtime/rendering/blocks/speaking/VoiceRecorderBlock.jsx`

**New Properties Added:**
```javascript
{
  prompt: "Recording prompt",
  referenceAudio: "path/to/reference.mp3",  // NEW
  audioFirst: false                         // NEW
}
```

**How It Was Modified:**
- Added optional reference audio playback
- `audioFirst` toggle requires reference audio playback before recording
- Students can replay reference audio before recording
- Answer data includes reference audio metadata

**Backward Compatible:** Yes - reference audio is optional

---

### TrueFalseBlock (Enhanced)

**Location:** `src/runtime/rendering/blocks/grammar/TrueFalseBlock.jsx`

**New Properties Added:**
```javascript
{
  question: "True or false statement",
  explanation: "Detailed explanation",
  hints: {
    replay: "Listen/Read the question again",
    visualClue: "Think about the main idea",
    sentenceStarter: "Start by thinking...",
    modelAnswer: "The answer is..."
  }
}
```

**How It Was Modified:**
- Integrated HintLadder.jsx component
- 4-stage hint system on wrong attempts
- Attempts tracked and capped
- Non-assessment mode enforces hints on wrong answer
- Assessment mode allows unlimited attempts

**Key Change:** Hint ladder component renders after wrong answer (attempt tracking)

---

### DragDropBlock (Enhanced)

**Location:** `src/runtime/rendering/blocks/grammar/DragDropBlock.jsx`

**New Properties Added:**
```javascript
{
  items: [...],
  targets: [...],
  hints: {
    replay: "Try dragging again...",
    visualClue: "Look at the pattern...",
    sentenceStarter: "Think about how...",
    modelAnswer: "The correct pairing is..."
  }
}
```

**How It Was Modified:**
- Integrated HintLadder.jsx component
- Wrong-attempt detection on incorrect drops
- 4-stage hint system triggers on wrong placement
- Tracks attempt count
- Allows retries until correct

**Key Change:** Validates drop positions and shows hints on failure

---

### WritingBlock (Enhanced)

**Location:** `src/runtime/rendering/blocks/writing/WritingBlock.jsx`

**New Properties Added:**
```javascript
{
  prompt: "Writing prompt",
  sentenceStarters: [
    "In my opinion...",
    "First of all...",
    "However...",
    "To conclude..."
  ]
}
```

**How It Was Modified:**
- Added array of sentence starter templates
- Quick-apply buttons displayed below prompt
- Clicking starter inserts text at cursor position
- Multiple starters supported
- Scaffolding help for struggling writers

**Key Change:** Added UI for starter templates with insertion logic

---

## Registry Changes

All new blocks require 3 registry updates:

### 1. ElementRegistry.js
**Location:** `src/runtime/rendering/ElementRegistry.js`

```javascript
// Added imports
import AudioMysteryBlock from "./blocks/listening/AudioMysteryBlock";
import YouAskBlock from "./blocks/speaking/YouAskBlock";
import RoleplaySimulationBlock from "./blocks/speaking/RoleplaySimulationBlock";
import HotspotExplorerBlock from "./blocks/reading/HotspotExplorerBlock";
import FunctionalReadingBlock from "./blocks/reading/FunctionalReadingBlock";

// Added to registry object
const registry = {
  // ... existing blocks
  audio_mystery: AudioMysteryBlock,
  you_ask: YouAskBlock,
  roleplay_simulation: RoleplaySimulationBlock,
  hotspot_explorer: HotspotExplorerBlock,
  functional_reading: FunctionalReadingBlock,
};
```

### 2. moduleRegistry.js
**Location:** `src/runtime/rendering/blocks/moduleRegistry.js`

```javascript
export const MODULE_BLOCKS = {
  listening: [..., "audio_mystery"],
  speaking: [..., "you_ask", "roleplay_simulation"],
  reading: [..., "hotspot_explorer", "functional_reading"],
  writing: [...],  // unchanged
  grammar: [...],  // unchanged
};
```

### 3. ScreenRenderer.jsx
**Location:** `src/runtime/rendering/ScreenRenderer.jsx`

```javascript
const GATING_TYPES = new Set([
  // ... existing types
  "you_ask",
  "hotspot_explorer",
  "functional_reading",
  "audio_mystery",
  "roleplay_simulation"
]);
```

---

## Utility Service Added

### HintLadder.jsx

**Location:** `src/runtime/rendering/services/HintLadder.jsx`

**How It's Used:**
- Imported by TrueFalseBlock, DragDropBlock, AudioMysteryBlock
- Provides reusable 4-stage hint progression
- Props:
  ```javascript
  {
    currentStage: 0,  // 0-3
    hints: {
      replay: "string",
      visualClue: "string",
      sentenceStarter: "string",
      modelAnswer: "string"
    },
    onNext: () => {}  // callback to advance stage
  }
  ```

**Benefits:**
- Code reuse across multiple blocks
- Consistent hint UX
- Easier to maintain and update

---

## Summary Table

| Block | Location | Type | Module | Lines | Status |
|---|---|---|---|---|---|
| YouAskBlock | speaking/ | `you_ask` | Speaking | ~250 | NEW |
| HotspotExplorerBlock | reading/ | `hotspot_explorer` | Reading | ~300 | NEW |
| FunctionalReadingBlock | reading/ | `functional_reading` | Reading | ~400 | NEW |
| AudioMysteryBlock | listening/ | `audio_mystery` | Listening | ~350 | NEW |
| RoleplaySimulationBlock | speaking/ | `roleplay_simulation` | Speaking | ~450 | NEW |
| QuizBlock | reading/ | `quiz`/`mcq` | Reading/Listening | +50 | ENHANCED |
| VoiceRecorderBlock | speaking/ | `voice_recorder` | Speaking | +50 | ENHANCED |
| TrueFalseBlock | grammar/ | `true_false` | Grammar | +80 | ENHANCED |
| DragDropBlock | grammar/ | `drag_drop` | Grammar | +80 | ENHANCED |
| WritingBlock | writing/ | `writing_prompt` | Writing | +50 | ENHANCED |
| HintLadder | services/ | utility | - | ~200 | NEW |

---

## Total Implementation

- **5 New Blocks:** ~1,750 lines
- **5 Enhanced Blocks:** ~310 lines
- **1 Utility Service:** ~200 lines
- **Registry Updates:** ~50 lines

**Total: ~2,310 lines of production code**

All blocks are production-ready and fully integrated with the runtime engine.
