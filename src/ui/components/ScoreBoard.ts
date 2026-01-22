/**
 * ScoreBoard Component
 *
 * Displays game statistics: current score, high score, lives remaining, and level.
 * Lives are shown as Pacman icons.
 */

export interface ScoreBoardProps {
  score: number;
  highScore: number;
  lives: number;
  level: number;
}

/**
 * Creates a ScoreBoard DOM element
 * @param props - ScoreBoard properties
 * @returns HTMLDivElement representing the scoreboard
 */
export function createScoreBoard(props: ScoreBoardProps): HTMLDivElement {
  const { score, highScore, lives, level } = props;

  const scoreboard = document.createElement('div');

  // Base class
  scoreboard.classList.add('scoreboard');

  // Data attributes for state access
  scoreboard.dataset.score = String(score);
  scoreboard.dataset.highScore = String(highScore);
  scoreboard.dataset.lives = String(lives);
  scoreboard.dataset.level = String(level);

  // Accessibility attributes
  scoreboard.setAttribute('role', 'status');
  scoreboard.setAttribute('aria-live', 'polite');
  scoreboard.setAttribute('aria-label', 'Game scoreboard');

  // Build scoreboard structure

  // Score section
  const scoreSection = document.createElement('div');
  scoreSection.classList.add('scoreboard__score');

  const scoreLabel = document.createElement('div');
  scoreLabel.classList.add('scoreboard__score-label');
  scoreLabel.textContent = 'SCORE';

  const scoreValue = document.createElement('div');
  scoreValue.classList.add('scoreboard__score-value');
  scoreValue.textContent = String(score);

  scoreSection.appendChild(scoreLabel);
  scoreSection.appendChild(scoreValue);

  // High score section
  const highScoreSection = document.createElement('div');
  highScoreSection.classList.add('scoreboard__highscore');

  const highScoreLabel = document.createElement('div');
  highScoreLabel.classList.add('scoreboard__highscore-label');
  highScoreLabel.textContent = 'HIGH SCORE';

  const highScoreValue = document.createElement('div');
  highScoreValue.classList.add('scoreboard__highscore-value');
  highScoreValue.textContent = String(highScore);

  highScoreSection.appendChild(highScoreLabel);
  highScoreSection.appendChild(highScoreValue);

  // Lives section
  const livesSection = document.createElement('div');
  livesSection.classList.add('scoreboard__lives');

  for (let i = 0; i < lives; i++) {
    const lifeIcon = document.createElement('div');
    lifeIcon.classList.add('scoreboard__life');
    livesSection.appendChild(lifeIcon);
  }

  // Level section
  const levelSection = document.createElement('div');
  levelSection.classList.add('scoreboard__level');

  const levelLabel = document.createElement('div');
  levelLabel.classList.add('scoreboard__level-label');
  levelLabel.textContent = 'LEVEL';

  const levelValue = document.createElement('div');
  levelValue.classList.add('scoreboard__level-value');
  levelValue.textContent = String(level);

  levelSection.appendChild(levelLabel);
  levelSection.appendChild(levelValue);

  // Assemble scoreboard
  scoreboard.appendChild(scoreSection);
  scoreboard.appendChild(highScoreSection);
  scoreboard.appendChild(livesSection);
  scoreboard.appendChild(levelSection);

  return scoreboard;
}
