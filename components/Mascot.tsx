
import React, { useEffect, useState, useRef } from 'react';
import { MascotMood } from '../types';
import { getRandomDialogue } from '../lib/mascot';

interface MascotProps {
  mood: MascotMood;
  onClick?: () => void;
  alignment?: 'header' | 'landing';
}

export const Mascot: React.FC<MascotProps> = ({ mood, onClick, alignment = 'header' }) => {
  const [dialogue, setDialogue] = useState<string>("Caw! Let's play!");
  const [bounce, setBounce] = useState(false);
  const [blink, setBlink] = useState(false);
  const [idleAction, setIdleAction] = useState<'NONE' | 'TILT' | 'HOP' | 'DANCE'>('NONE');
  const [isSleeping, setIsSleeping] = useState(false);
  
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset sleep timer on mood change or interaction
  useEffect(() => {
    setIsSleeping(false);
    setIdleAction('NONE');
    
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    
    // If IDLE for 15 seconds, go to sleep
    if (mood === 'IDLE') {
        interactionTimeout.current = setTimeout(() => {
            setIsSleeping(true);
            setDialogue(getRandomDialogue('SLEEPING'));
        }, 15000);
    }

    return () => {
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    };
  }, [mood, dialogue]); // Reset on dialogue change too implies activity

  // Reaction to mood changes
  useEffect(() => {
    let category: any = 'IDLE';
    if (mood === 'HAPPY') category = 'CORRECT';
    if (mood === 'MOCKING') category = 'WRONG';
    if (mood === 'IDLE') category = 'IDLE';
    if (mood === 'SURPRISED') category = 'IDLE'; 
    if (mood === 'EXCITED') category = 'PERSUADE';
    if (mood === 'HINT') category = 'HINT';

    if (mood !== 'IDLE' && mood !== 'THINKING' && mood !== 'SLEEPING') {
       setDialogue(getRandomDialogue(category));
       setBounce(true);
       const timer = setTimeout(() => setBounce(false), 1000);
       return () => clearTimeout(timer);
    }
  }, [mood]);

  // Auto-hide comments
  useEffect(() => {
      if (dialogue) {
          const timer = setTimeout(() => {
              setDialogue('');
          }, 6000);
          return () => clearTimeout(timer);
      }
  }, [dialogue]);

  // Idle animations (Dialogue, Blinking, Random Moves)
  useEffect(() => {
    // Talk timer
    const talkInterval = setInterval(() => {
      if (mood === 'IDLE' && !isSleeping && !dialogue) { 
        if (Math.random() > 0.65) { 
             setDialogue(getRandomDialogue('IDLE'));
             setBounce(true);
             setTimeout(() => setBounce(false), 500);
        }
      }
    }, 8000);

    // Blink timer
    const blinkInterval = setInterval(() => {
        if (!isSleeping) {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }
    }, 4000);

    // Random Move timer (Tilt, Hop)
    const moveInterval = setInterval(() => {
        if (mood === 'IDLE' && !isSleeping) {
            const rand = Math.random();
            if (rand > 0.7) {
                setIdleAction(rand > 0.85 ? 'HOP' : 'TILT');
                setTimeout(() => setIdleAction('NONE'), 1000);
            }
        }
    }, 3000);

    return () => {
        clearInterval(talkInterval);
        clearInterval(blinkInterval);
        clearInterval(moveInterval);
    };
  }, [mood, dialogue, isSleeping]);

  // Determine speech bubble styles
  // Landing Desktop: Far right (230% from left edge of container)
  // Landing Mobile: Centered below (140% from top edge)
  const bubbleStyles = alignment === 'landing'
    ? "md:left-[230%] md:top-1/2 md:-translate-y-1/2 md:origin-left left-1/2 -translate-x-1/2 top-[140%] origin-top"
    : "top-full right-full mr-2 mt-2 origin-top-right";

  // Border radius logic to make the "tail" look attached
  const bubbleRadius = alignment === 'landing'
    ? "rounded-2xl rounded-t-none md:rounded-2xl md:rounded-l-none"
    : "rounded-2xl rounded-tr-none";

  // Dynamic transforms based on state
  let bodyTransform = '';
  if (bounce) bodyTransform += ' -translate-y-2';
  if (idleAction === 'HOP') bodyTransform += ' -translate-y-4 rotate-3';
  if (idleAction === 'TILT') bodyTransform += ' rotate-12';
  if (mood === 'DANCING' || mood === 'EXCITED') bodyTransform += ' animate-bounce';

  return (
    <div 
      onClick={onClick}
      className="relative flex flex-col items-center justify-start pointer-events-auto cursor-pointer z-50 group select-none w-16 h-16 md:w-20 md:h-20"
    >
      {/* Speech Bubble */}
      <div 
        className={`
          absolute 
          w-28 md:w-36 bg-white text-black p-2 md:p-3 
          shadow-xl transition-all duration-300 transform
          border-2 border-neutral-100 z-50
          ${bubbleRadius}
          ${bubbleStyles}
          ${dialogue ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        `}
      >
        <p className="font-display font-bold text-[10px] md:text-xs leading-snug text-center text-neutral-800">
          {dialogue}
        </p>
      </div>

      {/* Sleeping Zzzs */}
      {isSleeping && (
        <div className="absolute -top-6 right-0 animate-pulse text-blue-200 font-bold font-display text-xl z-50">
          Zzz...
        </div>
      )}

      {/* CROW CONTAINER */}
      <div className={`relative w-full h-full transition-all duration-300 ease-in-out ${bodyTransform} ${bounce ? 'scale-110' : 'group-hover:scale-105'}`}>
        
        {/* Body - Perfect Circle */}
        <div className="absolute inset-0 bg-neutral-800 rounded-full shadow-lg flex items-center justify-center border-2 border-neutral-700">
            {/* Belly */}
            <div className="absolute bottom-1 w-10 h-8 bg-neutral-700/50 rounded-full"></div>
        </div>

        {/* Head Area (Conceptually same as body for round bird, but holding eyes) */}

        {/* Eyes */}
        {/* Left Eye */}
        <div className={`absolute top-4 left-2 w-5 h-5 bg-white rounded-full flex items-center justify-center overflow-hidden border border-neutral-200 ${mood === 'SURPRISED' ? 'h-6 w-6 -top-1' : ''}`}>
            {isSleeping ? (
                // Sleeping Eye (Line)
                <div className="w-4 h-0.5 bg-neutral-800 rounded-full mt-1"></div>
            ) : blink ? (
                // Blinking Eye (Line)
                <div className="w-3 h-0.5 bg-black rounded-full"></div>
            ) : (
                // Open Eye
                <div className={`bg-black rounded-full transition-all ${mood === 'SURPRISED' ? 'w-1 h-1' : 'w-2 h-2 translate-x-0.5 -translate-y-0.5'}`}></div>
            )}
        </div>

        {/* Right Eye */}
        <div className={`absolute top-4 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center overflow-hidden border border-neutral-200 ${mood === 'SURPRISED' ? 'h-6 w-6 -top-1' : ''}`}>
            {isSleeping ? (
                <div className="w-4 h-0.5 bg-neutral-800 rounded-full mt-1"></div>
            ) : blink ? (
                <div className="w-3 h-0.5 bg-black rounded-full"></div>
            ) : (
                <div className={`bg-black rounded-full transition-all ${mood === 'SURPRISED' ? 'w-1 h-1' : 'w-2 h-2 -translate-x-0.5 -translate-y-0.5'}`}></div>
            )}
        </div>
        
        {/* Cheeks (Blush) */}
        {!isSleeping && (
            <>
                <div className="absolute top-7 left-1 w-2 h-2 bg-pink-400 rounded-full opacity-60 blur-[1px]"></div>
                <div className="absolute top-7 right-1 w-2 h-2 bg-pink-400 rounded-full opacity-60 blur-[1px]"></div>
            </>
        )}

        {/* Beak */}
        <div className={`absolute left-1/2 -translate-x-1/2 bg-orange-400 rotate-45 rounded-sm border border-orange-500 shadow-sm z-20 transition-all
            ${mood === 'SURPRISED' ? 'top-8 w-2 h-2' : 'top-7 w-3 h-3'}
        `}></div>

        {/* Wings */}
        <div className={`absolute top-8 -left-1 w-3 h-6 bg-neutral-800 rounded-full border-2 border-neutral-700 origin-top-right transition-transform duration-300 
            ${bounce ? '-rotate-90' : 'rotate-12'}
            ${idleAction === 'HOP' ? '-rotate-45' : ''}
        `}></div>
        <div className={`absolute top-8 -right-1 w-3 h-6 bg-neutral-800 rounded-full border-2 border-neutral-700 origin-top-left transition-transform duration-300 
            ${bounce ? 'rotate-90' : '-rotate-12'}
            ${idleAction === 'HOP' ? 'rotate-45' : ''}
        `}></div>

        {/* Feet */}
        <div className="absolute bottom-0 left-5 w-1 h-2 bg-orange-400 rounded-full"></div>
        <div className="absolute bottom-0 right-5 w-1 h-2 bg-orange-400 rounded-full"></div>
      </div>
    </div>
  );
};

