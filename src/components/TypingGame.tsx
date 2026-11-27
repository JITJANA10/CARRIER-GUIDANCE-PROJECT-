import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { RotateCcw, Keyboard, CheckCircle2, Award } from 'lucide-react';
import { Badge } from './ui/Badge';

const SAMPLE_TEXT = "The ability to communicate effectively and type accurately is a core technical skill for modern digital careers. Being able to quickly draft specifications, write clean code, and document decisions gives you a direct velocity advantage in the workplace. Practice regularly to sharpen your typing speed and cognitive cadence.";

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
    const timeSpent = 60 - timeLeft;
    const minutes = timeSpent / 60;
    const wordsTyped = input.trim().split(/\s+/).length;
    
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
      let color = 'text-[#71717A]';
      if (index < userInput.length) {
        color = userInput[index] === char ? 'text-[#75D69A]' : 'text-rose-400 bg-rose-500/20 rounded-xs';
      }
      return (
        <span key={index} className={`${color} font-mono transition-colors`}>
          {char}
        </span>
      );
    });
  };

  return (
    <Card className="bg-[#202327] border-[#34383D]">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#34383D]">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-[#8B7CFF]" />
          <CardTitle className="text-sm">Typing Velocity Benchmark</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#71717A]">Time:</span>
            <span className="font-mono text-[#F4F4F5] font-semibold">{timeLeft}s</span>
          </div>
          <Button variant="outline" size="xs" onClick={restartGame} className="gap-1 border-[#34383D]">
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Real-time metrics bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-[#17191C] border border-[#34383D] text-center">
            <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">Speed</span>
            <div className="text-xl font-bold font-mono text-[#8B7CFF] mt-0.5">{wpm} <span className="text-xs text-[#71717A] font-normal">WPM</span></div>
          </div>
          <div className="p-3 rounded-lg bg-[#17191C] border border-[#34383D] text-center">
            <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">Accuracy</span>
            <div className="text-xl font-bold font-mono text-[#75D69A] mt-0.5">{accuracy}%</div>
          </div>
          <div className="p-3 rounded-lg bg-[#17191C] border border-[#34383D] text-center">
            <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">Status</span>
            <div className="mt-1">
              <Badge variant={isFinished ? "done" : isStarted ? "progress" : "todo"} dot>
                {isFinished ? "Completed" : isStarted ? "Live" : "Ready"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Display Text Box */}
        <div className="p-4 rounded-lg bg-[#17191C] border border-[#34383D] leading-relaxed text-xs select-none">
          {renderText()}
        </div>

        {/* Interactive Typing Area */}
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInput}
          disabled={isFinished}
          placeholder="Start typing the text above to begin benchmark..."
          rows={3}
          className="w-full bg-[#111214] border border-[#34383D] rounded-lg p-3 text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#8B7CFF] transition-colors resize-none disabled:opacity-50 font-mono"
        />

        {isFinished && (
          <div className="p-3 rounded-lg bg-[#75D69A]/10 border border-[#75D69A]/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#75D69A]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Assessment completed! Speed registered to your profile.</span>
            </div>
            <Button size="xs" variant="success" onClick={restartGame}>
              Retest
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
