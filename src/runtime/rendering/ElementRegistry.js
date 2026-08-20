// Listening
import AudioBlock from "./blocks/listening/AudioBlock";
import VideoBlock from "./blocks/listening/VideoBlock";
import SequenceBlock from "./blocks/listening/SequenceBlock";
import DictationBlock from "./blocks/listening/DictationBlock";
import AudioMysteryBlock from "./blocks/listening/AudioMysteryBlock";

// Speaking
import DialogueBlock from "./blocks/speaking/DialogueBlock";
import InputBlock from "./blocks/speaking/InputBlock";
import VoiceRecorderBlock from "./blocks/speaking/VoiceRecorderBlock";
import PronunciationBlock from "./blocks/speaking/PronunciationBlock";
import RolePlayBlock from "./blocks/speaking/RolePlayBlock";
import YouAskBlock from "./blocks/speaking/YouAskBlock";
import RoleplaySimulationBlock from "./blocks/speaking/RoleplaySimulationBlock";

// Reading
import TextBlock from "./blocks/reading/TextBlock";
import HeadingBlock from "./blocks/reading/HeadingBlock";
import ImageBlock from "./blocks/reading/ImageBlock";
import QuizBlock from "./blocks/reading/QuizBlock";
import MatchBlock from "./blocks/reading/MatchBlock";
import FlashcardBlock from "./blocks/reading/FlashcardBlock";
import MemoryBlock from "./blocks/reading/MemoryBlock";
import CrosswordBlock from "./blocks/reading/CrosswordBlock";
import WordSearchBlock from "./blocks/reading/WordSearchBlock";
import ReadingBlock from "./blocks/reading/ReadingBlock";
import HotspotExplorerBlock from "./blocks/reading/HotspotExplorerBlock";
import FunctionalReadingBlock from "./blocks/reading/FunctionalReadingBlock";

// Writing
import FillBlankBlock from "./blocks/writing/FillBlankBlock";
import SentenceBuilderBlock from "./blocks/writing/SentenceBuilderBlock";
import WritingBlock from "./blocks/writing/WritingBlock";

// Grammar
import TrueFalseBlock from "./blocks/grammar/TrueFalseBlock";
import DragDropBlock from "./blocks/grammar/DragDropBlock";
import GrammarCorrectionBlock from "./blocks/grammar/GrammarCorrectionBlock";

import { MODULE_BLOCKS } from "./blocks/moduleRegistry";

const registry = {

    // Listening
    audio: AudioBlock,
    video: VideoBlock,
    sequence: SequenceBlock,
    dictation: DictationBlock,
    audio_mystery: AudioMysteryBlock,

    // Speaking
    dialogue: DialogueBlock,
    input: InputBlock,
    voice_recorder: VoiceRecorderBlock,
    pronunciation: PronunciationBlock,
    role_play: RolePlayBlock,
    you_ask: YouAskBlock,
    roleplay_simulation: RoleplaySimulationBlock,

    // Reading
    text: TextBlock,
    heading: HeadingBlock,
    image: ImageBlock,
    quiz: QuizBlock,
    mcq: QuizBlock,
    match: MatchBlock,
    flashcard: FlashcardBlock,
    memory: MemoryBlock,
    crossword: CrosswordBlock,
    word_search: WordSearchBlock,
    reading_passage: ReadingBlock,
    hotspot_explorer: HotspotExplorerBlock,
    functional_reading: FunctionalReadingBlock,

    // Writing
    fill_blank: FillBlankBlock,
    sentence_builder: SentenceBuilderBlock,
    writing_prompt: WritingBlock,

    // Grammar
    true_false: TrueFalseBlock,
    drag_drop: DragDropBlock,
    grammar_correction: GrammarCorrectionBlock,

};

export function getBlocksForModule(moduleId) {

    return (MODULE_BLOCKS[moduleId] || []).map(type => registry[type]).filter(Boolean);

}

export default registry;
