import type { Meta, StoryObj } from '@storybook/html';
import { createScoreBoard, type ScoreBoardProps } from './ScoreBoard';

const meta: Meta<ScoreBoardProps> = {
  title: 'Components/ScoreBoard',
  tags: ['autodocs'],
  render: (args) => createScoreBoard(args),
  argTypes: {
    score: {
      control: { type: 'number' },
      description: 'Current score'
    },
    highScore: {
      control: { type: 'number' },
      description: 'High score'
    },
    lives: {
      control: { type: 'number', min: 0, max: 5 },
      description: 'Number of lives remaining'
    },
    level: {
      control: { type: 'number', min: 1 },
      description: 'Current level'
    }
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

export default meta;
type Story = StoryObj<ScoreBoardProps>;

// Default scoreboard
export const Default: Story = {
  args: {
    score: 0,
    highScore: 10000,
    lives: 3,
    level: 1
  }
};

// Game in progress
export const GameInProgress: Story = {
  args: {
    score: 2450,
    highScore: 10000,
    lives: 3,
    level: 1
  }
};

// High score beaten
export const HighScoreBeaten: Story = {
  args: {
    score: 15680,
    highScore: 15680,
    lives: 2,
    level: 2
  }
};

// Low lives
export const LowLives: Story = {
  args: {
    score: 8920,
    highScore: 10000,
    lives: 1,
    level: 3
  }
};

// No lives (game over state)
export const NoLives: Story = {
  args: {
    score: 5430,
    highScore: 10000,
    lives: 0,
    level: 2
  }
};

// High level
export const HighLevel: Story = {
  args: {
    score: 89500,
    highScore: 125000,
    lives: 3,
    level: 12
  }
};

// Maximum score display
export const MaxScore: Story = {
  args: {
    score: 999999,
    highScore: 999999,
    lives: 5,
    level: 99
  }
};

// Starting state
export const StartingState: Story = {
  args: {
    score: 0,
    highScore: 0,
    lives: 3,
    level: 1
  }
};
