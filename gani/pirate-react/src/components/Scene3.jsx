import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';
import { QUESTION_SETS } from '../data/questionSets';

export default function Scene3() {
  const {
    currentScene,
    selectedDoor,
    setSelectedDoor,
    unlockedDoors,
    completedDoors,
    unlockDoor,
    completeDoor,
    deductLife,
    flashNavigate,
    activeQuestionSet,
  } = useGame();

  const [door1Answer, setDoor1Answer] = useState('');
  const [door2Answer, setDoor2Answer] = useState('');
  const [door3Answer, setDoor3Answer] = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [panelShake, setPanelShake] = useState(false);

  const isActive = currentScene === 'scene-3';

  // Fallback if activeQuestionSet is not yet loaded
  const currentSet = activeQuestionSet || QUESTION_SETS[0];
  const door1Data = currentSet.doors?.[0] || QUESTION_SETS[0].doors[0];
  const door2Data = currentSet.doors?.[1] || QUESTION_SETS[0].doors[1];
  const door3Data = currentSet.doors?.[2] || QUESTION_SETS[0].doors[2];

  const switchDoor = useCallback((door) => {
    setSelectedDoor(door);
    setFeedback({ text: '', type: '' });
  }, [setSelectedDoor]);

  const triggerShake = useCallback(() => {
    setPanelShake(true);
    setTimeout(() => setPanelShake(false), 500);
  }, []);

  const handleDoor1Submit = useCallback(() => {
    const trimmed = door1Answer.trim();
    if (!trimmed) {
      soundController.playErrorSound();
      setFeedback({ text: 'Enter your answer first!', type: 'warning' });
      return;
    }

    if (door1Data && trimmed === door1Data.correctAnswer) {
      soundController.playSuccessChime();
      unlockDoor('door2');
      setFeedback({
        text: door1Data.successFeedback,
        type: 'success',
      });
      setTimeout(() => {
        switchDoor('door2');
      }, 1500);
    } else {
      soundController.playErrorSound();
      deductLife();
      triggerShake();
      setFeedback({
        text: door1Data?.errorFeedback || 'Incorrect! Calculate the strategy carefully.',
        type: 'error',
      });
    }
  }, [door1Answer, door1Data, unlockDoor, deductLife, triggerShake, switchDoor]);

  const handleDoor2Submit = useCallback(() => {
    const trimmed = door2Answer.trim();
    if (!trimmed) {
      soundController.playErrorSound();
      setFeedback({ text: 'Enter your answer before submitting!', type: 'warning' });
      return;
    }

    if (door2Data && trimmed === door2Data.correctAnswer) {
      soundController.playSuccessChime();
      unlockDoor('door3');
      setFeedback({
        text: door2Data.successFeedback,
        type: 'success',
      });
      setTimeout(() => {
        switchDoor('door3');
      }, 1500);
    } else {
      soundController.playErrorSound();
      deductLife();
      triggerShake();
      setFeedback({
        text: door2Data?.errorFeedback || 'Incorrect! Try again!',
        type: 'error',
      });
    }
  }, [door2Answer, door2Data, unlockDoor, deductLife, triggerShake, switchDoor]);

  const handleDoor3Submit = useCallback(() => {
    const trimmed = door3Answer.trim();
    if (!trimmed) {
      soundController.playErrorSound();
      setFeedback({ text: 'Enter your answer before submitting!', type: 'warning' });
      return;
    }

    if (door3Data && trimmed === door3Data.correctAnswer) {
      soundController.playSuccessChime();
      completeDoor('door3');
      setFeedback({
        text: door3Data.successFeedback,
        type: 'success',
      });
      setTimeout(() => {
        flashNavigate('scene-6');
      }, 1500);
    } else {
      soundController.playErrorSound();
      deductLife();
      triggerShake();
      setFeedback({
        text: door3Data?.errorFeedback || 'Incorrect! Recheck your logic and calculations.',
        type: 'error',
      });
    }
  }, [door3Answer, door3Data, completeDoor, deductLife, triggerShake, flashNavigate]);

  // Keyboard navigation / input listener for Doors 1, 2, and 3
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) {
        return;
      }

      if (selectedDoor === 'door1' || selectedDoor === 'door2' || selectedDoor === 'door3') {
        const isD1 = selectedDoor === 'door1';
        const isD2 = selectedDoor === 'door2';
        const currentAns = isD1 ? door1Answer : isD2 ? door2Answer : door3Answer;
        const setAns = isD1 ? setDoor1Answer : isD2 ? setDoor2Answer : setDoor3Answer;
        const submitFn = isD1 ? handleDoor1Submit : isD2 ? handleDoor2Submit : handleDoor3Submit;
        const maxLen = 6;

        if (e.key >= '0' && e.key <= '9') {
          if (currentAns.length < maxLen) {
            setAns((prev) => prev + e.key);
            soundController.playKeypadClick();
          }
        } else if (e.key === 'Backspace') {
          setAns((prev) => prev.slice(0, -1));
          soundController.playKeypadClick();
        } else if (e.key === 'Delete' || e.key === 'Escape') {
          setAns('');
          soundController.playKeypadClick();
        } else if (e.key === 'Enter') {
          submitFn();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      setFeedback({ text: '', type: '' });
    };
  }, [isActive, selectedDoor, door1Answer, door2Answer, door3Answer, handleDoor1Submit, handleDoor2Submit, handleDoor3Submit]);

  const handleKeypadPress = (key, action, door) => {
    soundController.playKeypadClick();
    const setAns = door === 'door1' ? setDoor1Answer : door === 'door2' ? setDoor2Answer : setDoor3Answer;
    const maxLen = 6;

    if (key !== undefined) {
      setAns((prev) => (prev.length < maxLen ? prev + key : prev));
    } else if (action === 'clear') {
      setAns('');
    } else if (action === 'backspace') {
      setAns((prev) => prev.slice(0, -1));
    }
  };

  const bgImageMap = {
    door1: '/assets/images/door1_crimson.jpg',
    door2: '/assets/images/door2_wooden.jpg',
    door3: '/assets/images/door3_azure.jpg',
  };

  const renderTabs = () => (
    <div className="level1-question-tabs-nav">
      <button
        className={`q-tab-btn ${selectedDoor === 'door1' ? 'active' : ''} ${completedDoors.door1 ? 'completed' : ''}`}
        onClick={() => switchDoor('door1')}
      >
        <span className="q-tab-num">QUESTION 1</span>
        <span className="q-tab-name">
          {door1Data.shortTitle || door1Data.title} {completedDoors.door1 ? '✓' : ''}
        </span>
      </button>
      <button
        className={`q-tab-btn ${selectedDoor === 'door2' ? 'active' : ''} ${!unlockedDoors.door2 ? 'disabled' : ''} ${completedDoors.door2 ? 'completed' : ''}`}
        disabled={!unlockedDoors.door2}
        onClick={() => switchDoor('door2')}
      >
        <span className="q-tab-num">QUESTION 2</span>
        <span className="q-tab-name">
          {door2Data.shortTitle || door2Data.title} {!unlockedDoors.door2 ? '🔒' : completedDoors.door2 ? '✓' : ''}
        </span>
      </button>
      <button
        className={`q-tab-btn ${selectedDoor === 'door3' ? 'active' : ''} ${!unlockedDoors.door3 ? 'disabled' : ''} ${completedDoors.door3 ? 'completed' : ''}`}
        disabled={!unlockedDoors.door3}
        onClick={() => switchDoor('door3')}
      >
        <span className="q-tab-num">QUESTION 3</span>
        <span className="q-tab-name">
          {door3Data.shortTitle || door3Data.title} {!unlockedDoors.door3 ? '🔒' : completedDoors.door3 ? '✓' : ''}
        </span>
      </button>
    </div>
  );

  const renderPuzzleBody = (bodyText, accentColor) => (
    <div className="puzzle-body-text">
      {bodyText && Array.isArray(bodyText) ? (
        bodyText.map((p, idx) => {
          if (p.startsWith('•')) {
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  margin: '4px 0 6px 10px',
                  lineHeight: '1.45',
                }}
              >
                <span style={{ color: accentColor || '#ffd24c', fontWeight: 'bold' }}>•</span>
                <span>{p.replace(/^•\s*/, '')}</span>
              </div>
            );
          }
          return (
            <p key={idx} style={{ margin: '0 0 10px 0', lineHeight: '1.55' }}>
              {p}
            </p>
          );
        })
      ) : (
        <p>{bodyText}</p>
      )}
    </div>
  );

  return (
    <section id="scene-3" className={`scene ${isActive ? 'active' : ''}`} data-active-door={selectedDoor}>
      <img
        src={bgImageMap[selectedDoor] || bgImageMap.door1}
        alt="Door Chamber Background"
        className="chamber-bg"
      />

      <div id="trial-container" style={{ width: '100%' }}>
        {/* Set Identifier Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#ffd24c',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
            padding: '5px 14px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 210, 76, 0.35)',
            width: 'fit-content',
            margin: '0 auto 12px auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span>📜</span>
          <span>SET {currentSet.setIndex || 1}: {currentSet.name}</span>
        </div>

        {/* ================= DOOR 1 ================= */}
        {selectedDoor === 'door1' && (
          <div className="trial-wrapper">
            {renderTabs()}

            <div className="trial-header-bar">
              <div className="trial-header-title">
                <span>{door1Data.headerIcon || '🔥'}</span>
                <span>{door1Data.headerTitle || 'DOOR 1: THE CRIMSON RUNES'}</span>
              </div>
              <div className="door-tag">{door1Data.tag || 'TRIAL 01'}</div>
            </div>

            <div className="door1-layout-grid">
              {/* LEFT: Question */}
              <div className="question-panel">
                <span className="puzzle-title-tag">{door1Data.questionNum || 'Question 1'}</span>
                <h2 className="puzzle-main-title">{door1Data.title}</h2>
                {renderPuzzleBody(door1Data.bodyText, door1Data.accentColor || '#ff4d4d')}
                <div className="puzzle-task-box">
                  <div className="task-label">TASK QUESTION:</div>
                  <div className="task-text">{door1Data.taskQuestion}</div>
                </div>
              </div>

              {/* RIGHT: Keypad & Input */}
              <div className={`door1-keypad-panel ${panelShake ? 'shake' : ''}`}>
                <div className="keypad-header-label">ANSWER</div>
                <div className="answer-box-container">
                  <div className={`answer-box ${!door1Answer ? 'placeholder-active' : ''}`}>
                    {door1Answer || 'Enter your answer'}
                  </div>
                </div>

                <div className="keypad-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      className="keypad-btn clickable"
                      onClick={() => handleKeypadPress(num.toString(), null, 'door1')}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    className="keypad-btn fn-btn clickable"
                    onClick={() => handleKeypadPress(undefined, 'backspace', 'door1')}
                  >
                    ←
                  </button>
                  <button
                    className="keypad-btn clickable"
                    onClick={() => handleKeypadPress('0', null, 'door1')}
                  >
                    0
                  </button>
                  <button
                    className="keypad-btn fn-btn clickable"
                    onClick={() => handleKeypadPress(undefined, 'clear', 'door1')}
                  >
                    C
                  </button>
                </div>

                <button className="submit-btn clickable" onClick={handleDoor1Submit}>
                  SUBMIT ANSWER
                </button>

                {feedback.text && (
                  <div className={`feedback-box ${feedback.type} show`}>
                    {feedback.text}
                  </div>
                )}

                <div className="action-buttons-group">
                  <button
                    className={`proceed-btn clickable ${unlockedDoors.door2 ? 'active' : ''}`}
                    disabled={!unlockedDoors.door2}
                    onClick={() => {
                      soundController.playDoorOpenSound();
                      switchDoor('door2');
                    }}
                  >
                    <span>PROCEED TO DOOR 2 →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= DOOR 2 ================= */}
        {selectedDoor === 'door2' && (
          <div className="trial-wrapper">
            {renderTabs()}

            <div className="trial-header-bar gold-theme" style={{ width: '100%' }}>
              <div className="trial-header-title">
                <span>{door2Data.headerIcon || '🗝️'}</span>
                <span>{door2Data.headerTitle || 'DOOR 2: THE ANCIENT TRIAL'}</span>
              </div>
              <div className="door-tag" style={{ color: '#ffd24c', borderColor: '#ffd24c' }}>
                {door2Data.tag || 'TRIAL 02'}
              </div>
            </div>

            <div className="door1-layout-grid">
              {/* LEFT: Question */}
              <div className="question-panel gold-theme">
                <span className="puzzle-title-tag">{door2Data.questionNum || 'Question 2'}</span>
                <h2 className="puzzle-main-title">{door2Data.title}</h2>
                {renderPuzzleBody(door2Data.bodyText, door2Data.accentColor || '#ffd24c')}
                <div className="puzzle-task-box">
                  <div className="task-label">TASK QUESTION:</div>
                  <div className="task-text">{door2Data.taskQuestion}</div>
                </div>
              </div>

              {/* RIGHT: Keypad Panel */}
              <div className={`door1-keypad-panel ${panelShake ? 'shake' : ''}`}>
                <div className="keypad-header-label">ANSWER</div>
                <div className="answer-box-container">
                  <div className={`answer-box ${!door2Answer ? 'placeholder-active' : ''}`}>
                    {door2Answer || 'Enter your answer'}
                  </div>
                </div>

                <div className="keypad-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      className="keypad-btn clickable"
                      onClick={() => handleKeypadPress(num.toString(), null, 'door2')}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    className="keypad-btn fn-btn clickable"
                    onClick={() => handleKeypadPress(undefined, 'backspace', 'door2')}
                  >
                    ←
                  </button>
                  <button
                    className="keypad-btn clickable"
                    onClick={() => handleKeypadPress('0', null, 'door2')}
                  >
                    0
                  </button>
                  <button
                    className="keypad-btn fn-btn clickable"
                    onClick={() => handleKeypadPress(undefined, 'clear', 'door2')}
                  >
                    C
                  </button>
                </div>

                <button className="submit-btn clickable" onClick={handleDoor2Submit}>
                  SUBMIT ANSWER
                </button>

                {feedback.text && (
                  <div className={`feedback-box ${feedback.type} show`}>
                    {feedback.text}
                  </div>
                )}

                <div className="action-buttons-group">
                  <button
                    className={`proceed-btn clickable ${unlockedDoors.door3 ? 'active' : ''}`}
                    disabled={!unlockedDoors.door3}
                    onClick={() => {
                      soundController.playDoorOpenSound();
                      switchDoor('door3');
                    }}
                  >
                    <span>PROCEED TO DOOR 3 →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= DOOR 3 ================= */}
        {selectedDoor === 'door3' && (
          <div className="trial-wrapper">
            {renderTabs()}

            <div className="trial-header-bar azure-theme" style={{ width: '100%' }}>
              <div className="trial-header-title">
                <span>{door3Data.headerIcon || '⚡'}</span>
                <span>{door3Data.headerTitle || 'DOOR 3: THE AZURE CIPHER'}</span>
              </div>
              <div className="door-tag" style={{ color: '#5ce1e6', borderColor: '#5ce1e6' }}>
                {door3Data.tag || 'TRIAL 03'}
              </div>
            </div>

            <div className="door1-layout-grid">
              {/* LEFT: Question */}
              <div className="question-panel azure-theme">
                <span className="puzzle-title-tag">{door3Data.questionNum || 'Question 3'}</span>
                <h2 className="puzzle-main-title">{door3Data.title}</h2>
                {renderPuzzleBody(door3Data.bodyText, door3Data.accentColor || '#5ce1e6')}
                <div className="puzzle-task-box">
                  <div className="task-label">TASK QUESTION:</div>
                  <div className="task-text">{door3Data.taskQuestion}</div>
                </div>
              </div>

              {/* RIGHT: Keypad Panel */}
              <div className={`door1-keypad-panel ${panelShake ? 'shake' : ''}`}>
                <div className="keypad-header-label" style={{ color: '#5ce1e6' }}>ANSWER</div>
                <div className="answer-box-container">
                  <div
                    className={`answer-box ${!door3Answer ? 'placeholder-active' : ''}`}
                    style={{ borderColor: '#5ce1e6', color: '#5ce1e6' }}
                  >
                    {door3Answer || 'Enter your answer'}
                  </div>
                </div>

                <div className="keypad-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      className="keypad-btn clickable"
                      onClick={() => handleKeypadPress(num.toString(), null, 'door3')}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    className="keypad-btn fn-btn clickable"
                    onClick={() => handleKeypadPress(undefined, 'backspace', 'door3')}
                  >
                    ←
                  </button>
                  <button
                    className="keypad-btn clickable"
                    onClick={() => handleKeypadPress('0', null, 'door3')}
                  >
                    0
                  </button>
                  <button
                    className="keypad-btn fn-btn clickable"
                    onClick={() => handleKeypadPress(undefined, 'clear', 'door3')}
                  >
                    C
                  </button>
                </div>

                <button
                  className="submit-btn clickable"
                  onClick={handleDoor3Submit}
                  style={{
                    background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
                    borderColor: '#5ce1e6',
                    color: '#ffffff',
                    boxShadow: '0 0 15px rgba(0, 180, 216, 0.4)',
                  }}
                >
                  SUBMIT ANSWER
                </button>

                {feedback.text && (
                  <div className={`feedback-box ${feedback.type} show`}>
                    {feedback.text}
                  </div>
                )}

                <div className="action-buttons-group">
                  <button
                    className={`proceed-btn clickable ${completedDoors.door3 ? 'active' : ''}`}
                    disabled={!completedDoors.door3}
                    onClick={() => {
                      soundController.playSuccessChime();
                      flashNavigate('scene-6');
                    }}
                  >
                    <span>⚡ ADVANCE TO ROUND 2 ➔</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
