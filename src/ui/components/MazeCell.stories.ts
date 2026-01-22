import type { Meta, StoryObj } from '@storybook/html';
import { createMazeCell, type MazeCellProps, type MazeCellType } from './MazeCell';

const meta: Meta<MazeCellProps> = {
  title: 'Components/MazeCell',
  tags: ['autodocs'],
  render: (args) => createMazeCell(args),
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['wall', 'path', 'tunnel', 'ghost-house', 'ghost-door'],
      description: 'Type of maze cell'
    }
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

export default meta;
type Story = StoryObj<MazeCellProps>;

// Wall cell - blue barrier
export const Wall: Story = {
  args: {
    type: 'wall'
  }
};

// Path cell - empty traversable space
export const Path: Story = {
  args: {
    type: 'path'
  }
};

// Tunnel cell - side passages for wrapping
export const Tunnel: Story = {
  args: {
    type: 'tunnel'
  }
};

// Ghost house cell - ghost spawn area
export const GhostHouse: Story = {
  args: {
    type: 'ghost-house'
  }
};

// Ghost door cell - entrance to ghost house
export const GhostDoor: Story = {
  args: {
    type: 'ghost-door'
  }
};

// All cell types comparison
export const AllTypes: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '20px';
    container.style.alignItems = 'flex-start';
    container.style.padding = '20px';
    container.style.flexWrap = 'wrap';

    const types: MazeCellType[] = ['wall', 'path', 'tunnel', 'ghost-house', 'ghost-door'];
    types.forEach(type => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '8px';

      const cell = createMazeCell({ type });

      const label = document.createElement('span');
      label.textContent = type;
      label.style.color = '#fff';
      label.style.fontSize = '11px';

      wrapper.appendChild(cell);
      wrapper.appendChild(label);
      container.appendChild(wrapper);
    });

    return container;
  }
};

// Path with pellet inside
export const PathWithPellet: Story = {
  render: () => {
    const cell = createMazeCell({ type: 'path' });

    const pellet = document.createElement('div');
    pellet.className = 'pellet pellet--small';
    cell.appendChild(pellet);

    return cell;
  }
};

// Path with power pellet inside
export const PathWithPowerPellet: Story = {
  render: () => {
    const cell = createMazeCell({ type: 'path' });

    const powerPellet = document.createElement('div');
    powerPellet.className = 'power-pellet power-pellet--animated';
    cell.appendChild(powerPellet);

    return cell;
  }
};

// Small maze section (3x3 grid)
export const MazeSection: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(5, 20px)';
    container.style.gap = '0';

    // Simple maze pattern: W=wall, P=path
    const pattern: MazeCellType[][] = [
      ['wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'path', 'path', 'path', 'wall'],
      ['wall', 'path', 'wall', 'path', 'wall'],
      ['wall', 'path', 'path', 'path', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall']
    ];

    pattern.forEach(row => {
      row.forEach(type => {
        const cell = createMazeCell({ type });
        container.appendChild(cell);
      });
    });

    return container;
  }
};

// Ghost house section
export const GhostHouseSection: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(6, 20px)';
    container.style.gap = '0';

    // Ghost house pattern
    const pattern: MazeCellType[][] = [
      ['wall', 'wall', 'ghost-door', 'ghost-door', 'wall', 'wall'],
      ['wall', 'ghost-house', 'ghost-house', 'ghost-house', 'ghost-house', 'wall'],
      ['wall', 'ghost-house', 'ghost-house', 'ghost-house', 'ghost-house', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall']
    ];

    pattern.forEach(row => {
      row.forEach(type => {
        const cell = createMazeCell({ type });
        container.appendChild(cell);
      });
    });

    return container;
  }
};
