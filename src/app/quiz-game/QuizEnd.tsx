"use client";

interface QuizEndProps {
  score: number | null;
  questions: any[];
  onClear: () => void;
}

export default function QuizEnd({ score, questions, onClear }: QuizEndProps) {
  return (
    <div className="flex flex-col gap-6 p-8 bg-white/90 rounded-xl shadow-xl animate-fade-in text-center">
      <h2 className="text-2xl font-bold text-green-700">Quiz Completed!</h2>
      <div className="text-lg">
        Your Score: <span className="font-bold text-green-600">{score !== null ? score : 0}</span> / {questions.length}
      </div>
      <button
        onClick={onClear}
        className="bg-gradient-to-r from-green-600 to-lime-400 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:scale-105 transition-transform duration-200"
      >
        Start New Quiz
      </button>
    </div>
  );
}
