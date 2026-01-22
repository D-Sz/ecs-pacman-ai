import type { Meta, StoryObj } from '@storybook/html';
import { createGameLayout, type GameLayoutProps } from './GameLayout';
import type { MazeCellData } from './MazeLayout';
import { ORIGINAL_MAZE } from '../../data/originalMaze';

// Sample maze data for stories
const sampleMaze: MazeCellData[][] = [
  [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
  [{ type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }],
  [{ type: 'wall' }, { type: 'path' }, { type: 'wall' }, { type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }, { type: 'wall' }, { type: 'path' }, { type: 'wall' }],
  [{ type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }],
  [{ type: 'tunnel' }, { type: 'path' }, { type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }, { type: 'path' }, { type: 'tunnel' }],
  [{ type: 'wall' }, { type: 'path' }, { type: 'wall' }, { type: 'ghost-house' }, { type: 'ghost-door' }, { type: 'ghost-door' }, { type: 'ghost-house' }, { type: 'wall' }, { type: 'path' }, { type: 'wall' }],
  [{ type: 'wall' }, { type: 'path' }, { type: 'wall' }, { type: 'ghost-house' }, { type: 'ghost-house' }, { type: 'ghost-house' }, { type: 'ghost-house' }, { type: 'wall' }, { type: 'path' }, { type: 'wall' }],
  [{ type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }],
  [{ type: 'wall' }, { type: 'path' }, { type: 'wall' }, { type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }, { type: 'wall' }, { type: 'path' }, { type: 'wall' }],
  [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
];

const meta: Meta<GameLayoutProps> = {
  title: 'Components/GameLayout',
  tags: ['autodocs'],
  render: (args) => createGameLayout(args),
  argTypes: {
    score: { control: { type: 'number' } },
    highScore: { control: { type: 'number' } },
    lives: { control: { type: 'number', min: 0, max: 5 } },
    level: { control: { type: 'number', min: 1 } },
    cellSize: { control: { type: 'number', min: 10, max: 40 } },
    showOverlay: { control: { type: 'boolean' } },
    overlayMessage: { control: { type: 'text' } }
  },
  parameters: {
    backgrounds: { default: 'dark' },
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<GameLayoutProps>;

// Default game layout
export const Default: Story = {
  args: {
    score: 0,
    highScore: 10000,
    lives: 3,
    level: 1,
    mazeData: sampleMaze,
    cellSize: 20
  }
};

// Game in progress
export const GameInProgress: Story = {
  args: {
    score: 3450,
    highScore: 10000,
    lives: 3,
    level: 1,
    mazeData: sampleMaze,
    cellSize: 20
  }
};

// Ready message
export const ReadyMessage: Story = {
  args: {
    score: 0,
    highScore: 10000,
    lives: 3,
    level: 1,
    mazeData: sampleMaze,
    cellSize: 20,
    showOverlay: true,
    overlayMessage: 'READY!'
  }
};

// Game over
export const GameOver: Story = {
  args: {
    score: 8750,
    highScore: 10000,
    lives: 0,
    level: 2,
    mazeData: sampleMaze,
    cellSize: 20,
    showOverlay: true,
    overlayMessage: 'GAME OVER'
  }
};

// Level complete
export const LevelComplete: Story = {
  args: {
    score: 15200,
    highScore: 15200,
    lives: 2,
    level: 1,
    mazeData: sampleMaze,
    cellSize: 20,
    showOverlay: true,
    overlayMessage: 'LEVEL COMPLETE!'
  }
};

// Paused
export const Paused: Story = {
  args: {
    score: 5600,
    highScore: 10000,
    lives: 3,
    level: 1,
    mazeData: sampleMaze,
    cellSize: 20,
    showOverlay: true,
    overlayMessage: 'PAUSED'
  }
};

// Small cells
export const SmallCells: Story = {
  args: {
    score: 1200,
    highScore: 10000,
    lives: 3,
    level: 1,
    mazeData: sampleMaze,
    cellSize: 14
  }
};

// Large cells
export const LargeCells: Story = {
  args: {
    score: 1200,
    highScore: 10000,
    lives: 3,
    level: 1,
    mazeData: sampleMaze,
    cellSize: 28
  }
};

// Original arcade maze
export const OriginalArcadeMaze: Story = {
  args: {
    score: 0,
    highScore: 10000,
    lives: 3,
    level: 1,
    mazeData: ORIGINAL_MAZE,
    cellSize: 16
  }
};

// Original maze - game in progress
export const OriginalMazeGameplay: Story = {
  args: {
    score: 4280,
    highScore: 10000,
    lives: 2,
    level: 1,
    mazeData: ORIGINAL_MAZE,
    cellSize: 16
  }
};

// Original maze - ready state
export const OriginalMazeReady: Story = {
  args: {
    score: 0,
    highScore: 10000,
    lives: 3,
    level: 1,
    mazeData: ORIGINAL_MAZE,
    cellSize: 16,
    showOverlay: true,
    overlayMessage: 'READY!'
  }
};

// Original maze - game over
export const OriginalMazeGameOver: Story = {
  args: {
    score: 12450,
    highScore: 15000,
    lives: 0,
    level: 3,
    mazeData: ORIGINAL_MAZE,
    cellSize: 16,
    showOverlay: true,
    overlayMessage: 'GAME OVER'
  }
};
