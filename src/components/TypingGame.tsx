import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { RotateCcw } from 'lucide-react';

const SAMPLE_TEXT = "The ability to communicate effectively and type accurately is a core skill for many modern careers. Being able to quickly draft emails, code, and document your work will give you a significant advantage in the workplace. Practice regularly to improve your typing speed and accuracy.";

export function TypingGame({ onComplete }: { onComplete?: (wpm: number, accuracy: number) => void }) {
  const [text] = useState(SAMPLE_TEXT);
  const [userInput, setUserInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isStarted && timeLeft > 0 && !isFinished) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted && !isFinished) {
      endGame();
    }
    return () => clearInterval(interval);
  }, [isStarted, timeLeft, isFinished]);

  const calculateStats = (input: string) => {
    const timeSpent = 60 - timeLeft; // in seconds
    const minutes = timeSpent / 60;
    const wordsTyped = input.trim().split(/\s+/).length;
    
    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === text[i]) {
        correctChars++;
      }
    }
    
    const currWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
    const currAccuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;
    
    return { currWpm, currAccuracy };
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    
    const val = e.target.value;
    if (!isStarted && val.length > 0) {
      setIsStarted(true);
    }
    
    setUserInput(val);
    
    const { currWpm, currAccuracy } = calculateStats(val);
    setWpm(currWpm);
    setAccuracy(currAccuracy);

    // Auto end if they finished the text
    if (val.length >= text.length) {
      endGame();
    }
  };

  const endGame = () => {
    setIsFinished(true);
    setIsStarted(false);
    if (onComplete) {
      onComplete(wpm, accuracy);
    }
  };

  const restartGame = () => {
    setUserInput('');
    setIsStarted(false);
    setIsFinished(false);
    setTimeLeft(60);
    setWpm(0);
    setAccuracy(100);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let color = 'text-slate-500'; // un-typed
      if (index < userInput.length) {
        color = userInput[index] === char ? 'text-green-400' : 'text-red-400 bg-red-400/20';
      }
      return (
        <span key={index} className={`${color} transition-colors`}>
          {char}
        </span>
      );
    });
  };

  return (
    <Card glass className="border-brand-blue/30 w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Typing Speed Assessment</CardTitle>
        <div className="flex gap-4 text-sm font-bold">
          <div className="bg-black/30 px-3 py-1 rounded border border-white/10 text-brand-cyan">
            {timeLeft}s
          </div>
          <div className="bg-black/30 px-3 py-1 rounded border border-white/10">
            {wpm} WPM
          </div>
          <div className="bg-black/30 px-3 py-1 rounded border border-white/10">
            {accuracy}% Acc
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-black/20 p-6 rounded-lg border border-white/5 font-mono text-lg leading-relaxed mb-4 select-none break-words min-h-[150px]">
          {renderText()}
        </div>
        
        {!isFinished ? (
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInput}
            placeholder="Start typing here to begin..."
            className="w-full bg-black/40 border border-brand-blue/50 rounded-lg p-4 text-white font-mono text-lg focus:outline-none focus:border-brand-cyan transition-colors resize-none h-32"
            spellCheck="false"
          />
        ) : (
          <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-lg p-6 text-center animate-in zoom-in duration-300">
            <h3 className="text-2xl font-bold text-white mb-2">Assessment Complete!</h3>
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <div className="text-sm text-slate-400">Speed</div>
                <div className="text-3xl font-bold text-brand-cyan">{wpm} <span className="text-lg">WPM</span></div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Accuracy</div>
                <div className="text-3xl font-bold text-green-400">{accuracy}%</div>
              </div>
            </div>
            <Button onClick={restartGame} className="bg-white text-black hover:bg-slate-200">
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
