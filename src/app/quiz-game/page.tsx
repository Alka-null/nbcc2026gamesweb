"use client";
import { useState, useEffect } from "react";
import QuizEnd from "./QuizEnd";

interface Question {
  id: number;
  number: number;
  text: string;
  options: string[];
}

export default function QuizGamePage() {
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [started, setStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitResult, setSubmitResult] = useState<null | { status: string; is_correct: boolean }>(null);
  const [loading, setLoading] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [completionMessage, setCompletionMessage] = useState("");
  const [challengeId, setChallengeId] = useState<number | null>(null);

  // Restore state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("quizgame_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserId(parsed.userId);
        setIsLoggedIn(parsed.isLoggedIn);
        setQuestions(parsed.questions || []);
        setCurrentIdx(parsed.currentIdx || 0);
        setStarted(parsed.started || false);
        setChallengeId(parsed.challengeId || null);
        // Set question start time if quiz was already started
        if (parsed.started) {
          setQuestionStartTime(Date.now());
        }
        // If logged in, fetch session
        if (parsed.isLoggedIn && parsed.userId && parsed.questions && parsed.questions.length > 0) {
          fetchGameSession(parsed.userId, parsed.questions);
        }
      } catch {}
    }
  }, []);

  async function fetchGameSession(unique_code: string, questions: Question[]) {
    try {
      console.log("Calling /api/gameplay/game_session/", { unique_code });
      // const sessionRes = await fetch("http://localhost:8000/api/gameplay/game_session/", {
      const sessionRes = await fetch("https://nbcc2026gamesbackend.onrender.com/api/gameplay/game_session/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unique_code }),
      });
      console.log("game_session response status", sessionRes.status);
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        console.log("game_session response data", sessionData);
        debugger;
        // Store challenge_id if present
        if (sessionData.challenge_id) {
          setChallengeId(sessionData.challenge_id);
        }
        // Check if challenge is completed
        if (sessionData.total_answered > 0 && sessionData.current_question === sessionData.total_answered) {
          setCompletionMessage("You have already completed this challenge.");
          setQuizCompleted(true);
          setScore(sessionData.score || 0);
          return;
        }
        
        const idx = questions.findIndex((q: Question) => q.id === sessionData.current_question);
        setCurrentIdx(idx >= 0 ? idx : 0);
      }
    } catch (err) {
      console.error("game_session error", err);
    }
  }

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "quizgame_state",
      JSON.stringify({ userId, isLoggedIn, questions, currentIdx, started, challengeId })
    );
  }, [userId, isLoggedIn, questions, currentIdx, started, challengeId]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    setCompletionMessage("");
    try {
      // Use the correct code login endpoint
      // const res = await fetch("http://localhost:8000/api/auth/code-login/", {
      const res = await fetch("https://nbcc2026gamesbackend.onrender.com/api/auth/code-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unique_code: code }),
      });
      if (!res.ok) throw new Error("Invalid code");
      const data = await res.json();
      // Store challenge_id if present in login response
      if (data.challenge_id) {
        setChallengeId(data.challenge_id);
      }
      setUserId(code);
      setIsLoggedIn(true);
      
      // Save unique code to localStorage for display badge & feedback
      localStorage.setItem("user_unique_code", code);
      
      // Fetch all questions after login
      // const qRes = await fetch("http://localhost:8000/api/gameplay/quiz_questions/");
      const qRes = await fetch("https://nbcc2026gamesbackend.onrender.com/api/gameplay/quiz_questions/");
      if (!qRes.ok) throw new Error("Failed to load questions");
      const qData = await qRes.json();
      setQuestions(qData.questions);
      
      // Fetch user session to get current question and check completion
      await fetchGameSession(code, qData.questions);
      setStarted(false);
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    debugger;
    console.log("Submitting answer for question", questions[currentIdx]?.id, "with selected answer", selectedAnswer);
    if (!userId || questions.length === 0) return;
    setLoading(true);
    setSubmitResult(null);
    try {
      const q = questions[currentIdx];
      const timeTaken = questionStartTime ? Math.round((Date.now() - questionStartTime) / 1000) : 0;
      console.log("Submitting answer:", {
        user_id: userId,
        question_id: q.id,
        answer: selectedAnswer,
        time_taken: timeTaken,
        challenge_id: challengeId,
      });
      // const res = await fetch("http://localhost:8000/api/gameplay/submit_answer/", {
      const res = await fetch("https://nbcc2026gamesbackend.onrender.com/api/gameplay/submit_answer/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          question_id: q.id,
          answer: selectedAnswer,
          time_taken: timeTaken,
          challenge_id: challengeId,
        }),
      });
      console.log("Submit response status:", res.status);
      const data = await res.json();
      console.log("Submit response data:", data);
      // Normalize the response format
      const normalizedResult = {
        status: res.ok ? "ok" : "error",
        is_correct: data.is_correct || data.correct || false,
        ...data
      };
      console.log("Normalized result:", normalizedResult);
      setSubmitResult(normalizedResult);
    } catch (err) {
      console.error("Submit answer error:", err);
      setSubmitResult({ status: "error", is_correct: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-green-600 to-lime-400 bg-clip-text text-transparent drop-shadow-lg animate-gradient-x">Quiz Game</h1>
      {!isLoggedIn ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-8 p-6 bg-white/80 rounded-xl shadow-lg animate-fade-in">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter your code"
            className="border px-3 py-2 rounded focus:ring-2 focus:ring-green-400 transition-all"
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-lime-400 text-white px-4 py-2 rounded shadow-md hover:scale-105 transition-transform duration-200"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-pulse">Logging in...</span>
            ) : "Login"}
          </button>
          {loginError && <div className="text-red-600 animate-shake">{loginError}</div>}
        </form>
      ) : quizCompleted ? (
        <QuizEnd
          score={score}
          questions={questions}
          onClear={() => {
            setUserId(null);
            setIsLoggedIn(false);
            setQuestions([]);
            setCurrentIdx(0);
            setStarted(false);
            setSelectedAnswer("");
            setSubmitResult(null);
            setScore(null);
            setQuizCompleted(false);
            setCompletionMessage("");
            localStorage.removeItem("quizgame_state");
          }}
        />
      ) : !started ? (
        completionMessage ? (
          <div className="text-green-700 font-bold text-center mt-4 animate-fade-in">{completionMessage}</div>
        ) : (
          <div className="flex flex-col gap-6 items-center animate-fade-in">
            <button
              className="bg-gradient-to-r from-green-600 to-lime-400 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-200 animate-bounce"
              onClick={async () => {
                try {
                  // await fetch("http://localhost:8000/api/gameplay/add_leaderboard_participant/", {
                  await fetch("https://nbcc2026gamesbackend.onrender.com/api/gameplay/add_leaderboard_participant/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ unique_code: userId }),
                  });
                } catch {}
                setStarted(true);
                setCurrentIdx(currentIdx);
                setSelectedAnswer("");
                setSubmitResult(null);
                setQuestionStartTime(Date.now());
              }}
              disabled={questions.length === 0}
            >
              Start Quiz
            </button>
            {questions.length === 0 && <div className="text-red-600 animate-shake">No questions loaded.</div>}
          </div>
        )
      ) : currentIdx < questions.length ? (
        <div className="flex flex-col gap-6 p-6 bg-white/90 rounded-xl shadow-xl animate-fade-in">
          <div className="mb-2">
            <div className="text-sm font-semibold text-gray-500 mb-1">Question {currentIdx + 1} of {questions.length}</div>
            <div className="font-bold text-lg text-green-700 animate-slide-in">{questions[currentIdx].text}</div>
          </div>
          <div className="flex flex-col gap-3">
            {questions[currentIdx].options.map(opt => (
              <label key={opt} className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer border transition-all duration-200 ${selectedAnswer === opt ? 'bg-green-100 border-green-400 scale-105' : 'bg-white border-gray-300 hover:bg-green-50'}`}>
                <input
                  type="radio"
                  name="answer"
                  value={opt}
                  checked={selectedAnswer === opt}
                  onChange={() => setSelectedAnswer(opt)}
                  disabled={!!submitResult}
                  className="accent-green-600 w-5 h-5"
                />
                <span className="text-base">{opt}</span>
              </label>
            ))}
          </div>
          {!submitResult && (
            <button
              onClick={handleSubmitAnswer}
              className={`mt-2 bg-gradient-to-r from-green-600 to-lime-400 text-white px-6 py-2 rounded-full font-semibold shadow-md transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-green-400 ${loading ? 'opacity-60 cursor-not-allowed' : ''} animate-pop`}
              disabled={!selectedAnswer || loading}
            >
              {loading ? (
                <span className="animate-pulse">Submitting...</span>
              ) : "Submit Answer"}
            </button>
          )}
          {submitResult && (
            <div className={submitResult.is_correct ? "text-green-600 font-bold animate-correct" : "text-red-600 font-bold animate-wrong"}>
              {submitResult.status === "ok"
                ? submitResult.is_correct
                  ? "Correct!"
                  : "Incorrect."
                : "Submission failed."}
            </div>
          )}
          {submitResult && submitResult.status === "ok" && (
            <button
              className="bg-gradient-to-r from-green-600 to-lime-400 text-white px-6 py-2 rounded-full font-semibold shadow-md mt-4 hover:scale-105 transition-transform duration-200 animate-pop"
              onClick={() => {
                if (currentIdx + 1 >= questions.length) {
                  // Quiz completed - clear localStorage and show end screen
                  setQuizCompleted(true);
                  setScore(submitResult.is_correct ? 1 : 0); // This is a simple calculation; backend should track full score
                  localStorage.removeItem("quizgame_state");
                } else {
                  setCurrentIdx(currentIdx + 1);
                  setSelectedAnswer("");
                  setSubmitResult(null);
                  setQuestionStartTime(Date.now());
                }
              }}
            >
              Next Question
            </button>
          )}
        </div>
      ) : (
        <QuizEnd
          score={score}
          questions={questions}
          onClear={() => {
            setUserId(null);
            setIsLoggedIn(false);
            setQuestions([]);
            setCurrentIdx(0);
            setStarted(false);
            setSelectedAnswer("");
            setSubmitResult(null);
            setScore(null);
            setQuizCompleted(false);
            setCompletionMessage("");
            localStorage.removeItem("quizgame_state");
          }}
        />
      )}
    </div>
  );
}
