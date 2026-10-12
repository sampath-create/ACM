import React, { useState, useEffect, useCallback, useRef } from 'react';
import soundController from '../utils/audio';
import { GameContext } from './GameContextDefinition';
import { getRandomQuestionSet } from '../data/questionSets';
import { getRandomSudokuSet } from '../data/sudokuSets';
import { getRandomMapScenario } from '../data/mapScenarios';
import { getRandomCodeSet } from '../data/codeSets';

export function GameProvider({ children }) {
  const [currentScene, setCurrentScene] = useState(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sceneParam = params?.get('scene') || params?.get('round');
    if (sceneParam === '1') return 'scene-3';
    if (sceneParam === '2') return 'scene-6';
    if (sceneParam === '3' || sceneParam === 'round3' || sceneParam === 'scene-10') return 'scene-10';
    if (sceneParam === '4' || sceneParam === 'round4' || sceneParam === 'scene-9') return 'scene-9';

    // Every time we open the link, ALWAYS start fresh from scene-1!
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('pirate_current_scene');
        localStorage.removeItem('pirate_level2_completed');
        localStorage.removeItem('pirate_unlocked_doors');
        localStorage.removeItem('pirate_completed_doors');
        localStorage.removeItem('pirate_time_left');
        localStorage.removeItem('pirate_warnings');
        localStorage.removeItem('pirate_game_over_reason');
        localStorage.removeItem('pirate_game_started');
        localStorage.removeItem('pirate_active_question_set');
        localStorage.removeItem('pirate_active_sudoku_set');
        localStorage.removeItem('pirate_active_map_scenario');
        localStorage.removeItem('pirate_active_code_set');
      } catch (e) {}
    }
    return 'scene-1';
  });

  // Round 1 Question Set (Door 1, Door 2, Door 3)
  const [activeQuestionSet, setActiveQuestionSet] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pirate_active_question_set');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.doors && parsed.doors.length === 3) return parsed;
        } catch (e) {}
      }
    }
    const fresh = getRandomQuestionSet(true);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pirate_active_question_set', JSON.stringify(fresh));
      } catch (e) {}
    }
    return fresh;
  });

  // Round 2 Sudoku Set
  const [activeSudokuSet, setActiveSudokuSet] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pirate_active_sudoku_set');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.clues) return parsed;
        } catch (e) {}
      }
    }
    const fresh = getRandomSudokuSet();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pirate_active_sudoku_set', JSON.stringify(fresh));
      } catch (e) {}
    }
    return fresh;
  });

  // Round 3 Map Scenario Set
  const [activeMapScenario, setActiveMapScenario] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pirate_active_map_scenario');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id) return parsed;
        } catch (e) {}
      }
    }
    const fresh = getRandomMapScenario();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pirate_active_map_scenario', JSON.stringify(fresh));
      } catch (e) {}
    }
    return fresh;
  });

  // Round 4 Java Algorithm Code Set
  const [activeCodeSet, setActiveCodeSet] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pirate_active_code_set');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.validOrderMainFirst) return parsed;
        } catch (e) {}
      }
    }
    const fresh = getRandomCodeSet();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pirate_active_code_set', JSON.stringify(fresh));
      } catch (e) {}
    }
    return fresh;
  });

  const [selectedDoor, setSelectedDoor] = useState('door1');
  const [flashActive, setFlashActive] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [gameStarted, setGameStarted] = useState(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sceneParam = params?.get('scene') || params?.get('round');
    return Boolean(sceneParam);
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sceneParam = params?.get('scene') || params?.get('round');
    if (!sceneParam) return 90 * 60; // 90 minutes fresh
    const saved = localStorage.getItem('pirate_time_left');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return 90 * 60;
  });

  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(80);
  const [unlockedDoors, setUnlockedDoors] = useState(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sceneParam = params?.get('scene') || params?.get('round');
    if (sceneParam) return { door1: true, door2: true, door3: true };
    return { door1: true, door2: false, door3: false };
  });

  const [completedDoors, setCompletedDoors] = useState(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sceneParam = params?.get('scene') || params?.get('round');
    if (sceneParam) return { door1: true, door2: true, door3: true };
    return { door1: false, door2: false, door3: false };
  });

  const [level2Completed, setLevel2Completed] = useState(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sceneParam = params?.get('scene') || params?.get('round');
    return Boolean(sceneParam && (sceneParam === '3' || sceneParam === '4' || sceneParam === 'round3' || sceneParam === 'round4'));
  });

  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [shakeLife, setShakeLife] = useState(false);
  const toastTimeoutRef = useRef(null);
  const lastViolationTimeRef = useRef(0);

  // Sync current scene to storage
  useEffect(() => {
    localStorage.setItem('pirate_current_scene', currentScene);
  }, [currentScene]);

  // 90-Minute Game Countdown Timer
  useEffect(() => {
    if (!gameStarted || gameOver || currentScene === 'scene-1') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          localStorage.setItem('pirate_time_left', '0');
          setGameOverReason('time_expired');
          localStorage.setItem('pirate_game_over_reason', 'time_expired');
          setTimeout(() => setGameOver(true), 500);
          return 0;
        }
        const next = prev - 1;
        localStorage.setItem('pirate_time_left', next.toString());
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, currentScene]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    soundController.playErrorSound();
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 2800);
  }, []);

  const deductLife = useCallback(() => {
    // Lives removed - no lives deduction or depletion game over
  }, []);

  const unlockDoor = useCallback((doorId) => {
    setUnlockedDoors((prev) => {
      const next = { ...prev, [doorId]: true };
      localStorage.setItem('pirate_unlocked_doors', JSON.stringify(next));
      return next;
    });
    setCompletedDoors((prev) => {
      const next = { ...prev };
      if (doorId === 'door2') next.door1 = true;
      if (doorId === 'door3') next.door2 = true;
      localStorage.setItem('pirate_completed_doors', JSON.stringify(next));
      return next;
    });
  }, []);

  const completeDoor = useCallback((doorId) => {
    setCompletedDoors((prev) => {
      const next = { ...prev, [doorId]: true };
      localStorage.setItem('pirate_completed_doors', JSON.stringify(next));
      return next;
    });
  }, []);

  const completeLevel2 = useCallback(() => {
    setLevel2Completed(true);
    localStorage.setItem('pirate_level2_completed', 'true');
  }, []);

  const getNextTargetDoor = useCallback(() => {
    if (!completedDoors.door1) return 'door1';
    if (!completedDoors.door2) return 'door2';
    if (!completedDoors.door3) return 'door3';
    return 'door1';
  }, [completedDoors]);

  const navigateTo = useCallback(
    (sceneId) => {
      const isL2Done = level2Completed || localStorage.getItem('pirate_level2_completed') === 'true';
      const isL1Done = completedDoors.door3 || localStorage.getItem('pirate_completed_doors')?.includes('"door3":true');

      if (warningCount >= 3 && sceneId !== 'scene-1') {
        setGameOver(true);
        return;
      }
      if (sceneId === 'scene-5' && !isL1Done) {
        showToast('Complete Level 1 first to unlock Level 2!');
        return;
      }
      if (sceneId === 'scene-9') {
        setLevel2Completed(true);
        localStorage.setItem('pirate_level2_completed', 'true');
      }
      if (sceneId === 'scene-9' && !isL2Done && currentScene !== 'scene-8') {
        showToast('Complete Level 2 first to unlock Level 3!');
        return;
      }
      setCurrentScene(sceneId);
    },
    [lives, warningCount, completedDoors, level2Completed, currentScene, showToast]
  );

  const flashNavigate = useCallback(
    (sceneId) => {
      setFlashActive(true);
      setTimeout(() => {
        navigateTo(sceneId);
        setFlashActive(false);
      }, 800);
    },
    [navigateTo]
  );

  const shuffleQuestions = useCallback(() => {
    const freshSet = getRandomQuestionSet(true);
    setActiveQuestionSet(freshSet);
    localStorage.setItem('pirate_active_question_set', JSON.stringify(freshSet));
    return freshSet;
  }, []);

  const resetGame = useCallback(() => {
    setLives(5);
    setUnlockedDoors({ door1: true, door2: false, door3: false });
    setCompletedDoors({ door1: false, door2: false, door3: false });
    setLevel2Completed(false);
    setGameOver(false);
    setGameOverReason('');
    setWarningCount(0);
    setGameStarted(false);
    setTimeLeft(90 * 60);
    const freshSet = getRandomQuestionSet(true);
    setActiveQuestionSet(freshSet);
    localStorage.setItem('pirate_active_question_set', JSON.stringify(freshSet));

    const freshSudoku = getRandomSudokuSet();
    setActiveSudokuSet(freshSudoku);
    localStorage.setItem('pirate_active_sudoku_set', JSON.stringify(freshSudoku));

    const freshMap = getRandomMapScenario();
    setActiveMapScenario(freshMap);
    localStorage.setItem('pirate_active_map_scenario', JSON.stringify(freshMap));

    const freshCode = getRandomCodeSet();
    setActiveCodeSet(freshCode);
    localStorage.setItem('pirate_active_code_set', JSON.stringify(freshCode));

    localStorage.setItem('pirate_time_left', (90 * 60).toString());
    localStorage.setItem('pirate_lives', '5');
    localStorage.setItem('pirate_unlocked_doors', JSON.stringify({ door1: true, door2: false, door3: false }));
    localStorage.setItem('pirate_completed_doors', JSON.stringify({ door1: false, door2: false, door3: false }));
    localStorage.removeItem('pirate_level2_completed');
    localStorage.removeItem('pirate_warnings');
    localStorage.removeItem('pirate_game_over_reason');
    localStorage.removeItem('pirate_game_started');
    localStorage.setItem('pirate_current_scene', 'scene-1');
    setCurrentScene('scene-1');
  }, []);

  const toggleAudio = useCallback(() => {
    soundController.init();
    const muted = soundController.toggleMute();
    setIsMuted(muted);
  }, []);


  // Tab switch / blur detection for anti-cheat
  useEffect(() => {
    const triggerViolation = () => {
      if (!gameStarted || currentScene === 'scene-1' || gameOver) return;

      const now = Date.now();
      if (now - lastViolationTimeRef.current < 1200) return;
      lastViolationTimeRef.current = now;

      setWarningCount((prev) => {
        const next = prev + 1;
        localStorage.setItem('pirate_warnings', next.toString());
        if (next >= 3) {
          showToast('☠️ DISQUALIFIED! You switched tabs 3 times. The cave is sealed forever!');
          setGameOverReason('warnings_exceeded');
          localStorage.setItem('pirate_game_over_reason', 'warnings_exceeded');
          setTimeout(() => {
            setGameOver(true);
          }, 600);
        } else {
          showToast(`⚠️ WARNING ${next}/3: Tab switch detected! ${3 - next} chance${3 - next > 1 ? 's' : ''} remaining before disqualification.`);
        }
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation();
      }
    };

    const handleBlur = () => {
      triggerViolation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameStarted, currentScene, gameOver, showToast]);

  // Block dev tools, refresh, copy, print, view-source, and right-click for the ENTIRE game
  useEffect(() => {
    const blockKeydown = (e) => {
      // F12 — Dev Tools
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        if (gameStarted && !gameOver) showToast('🚫 Developer tools are disabled during the trial!');
        return false;
      }
      // F5 — Refresh
      if (e.key === 'F5') {
        e.preventDefault();
        e.stopPropagation();
        if (gameStarted && !gameOver) showToast('🚫 Page refresh is disabled during the trial!');
        return false;
      }
      // Ctrl+R — Refresh
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        e.stopPropagation();
        if (gameStarted && !gameOver) showToast('🚫 Page refresh is disabled during the trial!');
        return false;
      }
      // Ctrl+Shift+I — Dev Tools (Elements)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        e.stopPropagation();
        if (gameStarted && !gameOver) showToast('🚫 Developer tools are disabled during the trial!');
        return false;
      }
      // Ctrl+Shift+J — Dev Tools (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        e.stopPropagation();
        if (gameStarted && !gameOver) showToast('🚫 Developer console is disabled during the trial!');
        return false;
      }
      // Ctrl+Shift+C — Dev Tools (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        e.stopPropagation();
        if (gameStarted && !gameOver) showToast('🚫 Element inspector is disabled during the trial!');
        return false;
      }
      // Ctrl+C — Copy
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        e.stopPropagation();
        if (gameStarted && !gameOver) showToast('🚫 Copying is disabled during the trial!');
        return false;
      }
      // Ctrl+P — Print
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        if (gameStarted && !gameOver) showToast('🚫 Printing is disabled during the trial!');
        return false;
      }
      // Ctrl+U — View Source
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        e.stopPropagation();
        if (gameStarted && !gameOver) showToast('🚫 View source is disabled during the trial!');
        return false;
      }
      // Ctrl+S — Save page
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+Shift+K — Firefox console
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+Shift+M — Firefox responsive design mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Block right-click context menu
    const blockContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (gameStarted && !gameOver) showToast('🚫 Right-click is disabled during the trial!');
      return false;
    };

    // Block text selection and dragging (anti-copy)
    const blockSelectStart = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
    };

    const blockDragStart = (e) => {
      e.preventDefault();
    };

    // Attach all listeners with capture to intercept before any other handler
    document.addEventListener('keydown', blockKeydown, true);
    document.addEventListener('contextmenu', blockContextMenu, true);
    document.addEventListener('selectstart', blockSelectStart, true);
    document.addEventListener('dragstart', blockDragStart, true);

    return () => {
      document.removeEventListener('keydown', blockKeydown, true);
      document.removeEventListener('contextmenu', blockContextMenu, true);
      document.removeEventListener('selectstart', blockSelectStart, true);
      document.removeEventListener('dragstart', blockDragStart, true);
    };
  }, [gameStarted, gameOver, showToast]);

  const [rulesCallback, setRulesCallback] = useState(null);

  const openRulesModal = useCallback((callback) => {
    if (callback) {
      setRulesCallback(() => callback);
    }
    setRulesModalOpen(true);
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    localStorage.setItem('pirate_game_started', 'true');
  }, []);

  const acceptRules = useCallback(() => {
    soundController.playSuccessChime();
    setRulesModalOpen(false);
    setGameStarted(true);
    localStorage.setItem('pirate_game_started', 'true');
    if (rulesCallback) {
      rulesCallback();
      setRulesCallback(null);
    }
  }, [rulesCallback]);

  const goToRound = useCallback((roundNum) => {
    soundController.playDoorOpenSound();
    if (roundNum === 1) {
      setCurrentScene('scene-3');
    } else if (roundNum === 2) {
      setCurrentScene('scene-6');
    } else if (roundNum === 3) {
      setLevel2Completed(true);
      localStorage.setItem('pirate_level2_completed', 'true');
      localStorage.setItem('pirate_current_scene', 'scene-10');
      localStorage.setItem('pirate_game_started', 'true');
      setGameOver(false);
      setCurrentScene('scene-10');
    } else if (roundNum === 4) {
      setLevel2Completed(true);
      localStorage.setItem('pirate_level2_completed', 'true');
      localStorage.setItem('pirate_current_scene', 'scene-9');
      localStorage.setItem('pirate_game_started', 'true');
      setGameOver(false);
      setCurrentScene('scene-9');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.goToRound = goToRound;
    }
  }, [goToRound]);

  const value = {
    goToRound,
    currentScene,
    setCurrentScene,
    selectedDoor,
    setSelectedDoor,
    lives,
    deductLife,
    unlockedDoors,
    completedDoors,
    unlockDoor,
    completeDoor,
    level2Completed,
    completeLevel2,
    gameOver,
    setGameOver,
    gameOverReason,
    setGameOverReason,
    isMuted,
    toggleAudio,
    navigateTo,
    flashNavigate,
    resetGame,
    getNextTargetDoor,
    showToast,
    toastMessage,
    toastVisible,
    warningCount,
    setWarningCount,
    shakeLife,
    flashActive,
    setFlashActive,
    rulesModalOpen,
    setRulesModalOpen,
    openRulesModal,
    acceptRules,
    gameStarted,
    startGame,
    timeLeft,
    setTimeLeft,
    activeQuestionSet,
    shuffleQuestions,
    activeSudokuSet,
    activeMapScenario,
    activeCodeSet,
    score,
    setScore,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
