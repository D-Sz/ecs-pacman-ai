import type { Meta, StoryObj } from '@storybook/html';
import { createMazeLayout, type MazeLayoutProps, type MazeCellData } from './MazeLayout';
import { ORIGINAL_MAZE } from '../../data/originalMaze';

// Sample maze data (simplified 10x10 for stories)
const sampleMazeSmall: MazeCellData[][] = [
  // Row 0 - top wall
  [
    { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' },
    { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }
  ],
  // Row 1
  [
    { type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' },
    { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }
  ],
  // Row 2
  [
    { type: 'wall' }, { type: 'path' }, { type: 'wall' }, { type: 'wall' }, { type: 'path' },
    { type: 'path' }, { type: 'wall' }, { type: 'wall' }, { type: 'path' }, { type: 'wall' }
  ],
  // Row 3
  [
    { type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' },
    { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }
  ],
  // Row 4 - with tunnel
  [
    { type: 'tunnel' }, { type: 'path' }, { type: 'wall' }, { type: 'path' }, { type: 'path' },
    { type: 'path' }, { type: 'path' }, { type: 'wall' }, { type: 'path' }, { type: 'tunnel' }
  ],
  // Row 5 - ghost house area
  [
    { type: 'wall' }, { type: 'path' }, { type: 'wall' }, { type: 'ghost-house' }, { type: 'ghost-door' },
    { type: 'ghost-door' }, { type: 'ghost-house' }, { type: 'wall' }, { type: 'path' }, { type: 'wall' }
  ],
  // Row 6
  [
    { type: 'wall' }, { type: 'path' }, { type: 'wall' }, { type: 'ghost-house' }, { type: 'ghost-house' },
    { type: 'ghost-house' }, { type: 'ghost-house' }, { type: 'wall' }, { type: 'path' }, { type: 'wall' }
  ],
  // Row 7
  [
    { type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' },
    { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }
  ],
  // Row 8
  [
    { type: 'wall' }, { type: 'path' }, { type: 'wall' }, { type: 'wall' }, { type: 'path' },
    { type: 'path' }, { type: 'wall' }, { type: 'wall' }, { type: 'path' }, { type: 'wall' }
  ],
  // Row 9 - bottom wall
  [
    { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' },
    { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }
  ],
];

// Minimal maze for testing
const minimalMaze: MazeCellData[][] = [
  [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
  [{ type: 'wall' }, { type: 'path' }, { type: 'wall' }],
  [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
];

const meta: Meta<MazeLayoutProps> = {
  title: 'Components/MazeLayout',
  tags: ['autodocs'],
  render: (args) => createMazeLayout(args),
  argTypes: {
    cellSize: {
      control: { type: 'number', min: 10, max: 40 },
      description: 'Size of each cell in pixels'
    }
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

export default meta;
type Story = StoryObj<MazeLayoutProps>;

// Default maze layout
export const Default: Story = {
  args: {
    mazeData: sampleMazeSmall,
    cellSize: 20
  }
};

// Small cell size
export const SmallCells: Story = {
  args: {
    mazeData: sampleMazeSmall,
    cellSize: 12
  }
};

// Large cell size
export const LargeCells: Story = {
  args: {
    mazeData: sampleMazeSmall,
    cellSize: 30
  }
};

// Minimal maze
export const MinimalMaze: Story = {
  args: {
    mazeData: minimalMaze,
    cellSize: 40
  }
};

// Just walls and paths
export const WallsAndPaths: Story = {
  args: {
    mazeData: [
      [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
      [{ type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }],
      [{ type: 'wall' }, { type: 'path' }, { type: 'wall' }, { type: 'path' }, { type: 'wall' }],
      [{ type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }],
      [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
    ],
    cellSize: 20
  }
};

// Corridor with tunnel
export const CorridorWithTunnel: Story = {
  args: {
    mazeData: [
      [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
      [{ type: 'tunnel' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'tunnel' }],
      [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
    ],
    cellSize: 20
  }
};

// Ghost house detail
export const GhostHouse: Story = {
  args: {
    mazeData: [
      [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
      [{ type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }],
      [{ type: 'wall' }, { type: 'wall' }, { type: 'ghost-door' }, { type: 'ghost-door' }, { type: 'wall' }, { type: 'wall' }],
      [{ type: 'wall' }, { type: 'ghost-house' }, { type: 'ghost-house' }, { type: 'ghost-house' }, { type: 'ghost-house' }, { type: 'wall' }],
      [{ type: 'wall' }, { type: 'ghost-house' }, { type: 'ghost-house' }, { type: 'ghost-house' }, { type: 'ghost-house' }, { type: 'wall' }],
      [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
    ],
    cellSize: 20
  }
};

// Original Pac-Man arcade maze (28x28)
export const OriginalMaze: Story = {
  args: {
    mazeData: ORIGINAL_MAZE,
    cellSize: 16
  }
};

// Original maze with larger cells
export const OriginalMazeLarge: Story = {
  args: {
    mazeData: ORIGINAL_MAZE,
    cellSize: 20
  }
};
