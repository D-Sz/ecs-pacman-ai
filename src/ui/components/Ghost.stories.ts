import type { Meta, StoryObj } from '@storybook/html';
import { createGhost, type GhostProps, type GhostType, type GhostState, type GhostLookDirection } from './Ghost';

const meta: Meta<GhostProps> = {
  title: 'Components/Ghost',
  tags: ['autodocs'],
  render: (args) => createGhost(args),
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['blinky', 'pinky', 'inky', 'clyde'],
      description: 'Ghost character type (determines color)'
    },
    state: {
      control: { type: 'select' },
      options: ['normal', 'frightened', 'flashing', 'eyes-only'],
      description: 'Ghost visual state'
    },
    lookDirection: {
      control: { type: 'select' },
      options: ['right', 'left', 'up', 'down'],
      description: 'Direction the ghost eyes are looking'
    }
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

export default meta;
type Story = StoryObj<GhostProps>;

// Default ghost (Blinky)
export const Default: Story = {
  args: {
    type: 'blinky',
    state: 'normal',
    lookDirection: 'right'
  }
};

// Blinky (Red)
export const Blinky: Story = {
  args: {
    type: 'blinky',
    state: 'normal',
    lookDirection: 'right'
  }
};

// Pinky (Pink)
export const Pinky: Story = {
  args: {
    type: 'pinky',
    state: 'normal',
    lookDirection: 'left'
  }
};

// Inky (Cyan)
export const Inky: Story = {
  args: {
    type: 'inky',
    state: 'normal',
    lookDirection: 'up'
  }
};

// Clyde (Orange)
export const Clyde: Story = {
  args: {
    type: 'clyde',
    state: 'normal',
    lookDirection: 'down'
  }
};

// All ghost types comparison
export const AllGhostTypes: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '40px';
    container.style.alignItems = 'center';
    container.style.padding = '20px';

    const types: GhostType[] = ['blinky', 'pinky', 'inky', 'clyde'];
    const colors = ['Red', 'Pink', 'Cyan', 'Orange'];

    types.forEach((type, index) => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '10px';

      const ghost = createGhost({ type, state: 'normal', lookDirection: 'right' });
      ghost.style.position = 'relative';

      const label = document.createElement('span');
      label.textContent = `${type} (${colors[index]})`;
      label.style.color = '#fff';
      label.style.fontSize = '12px';
      label.style.textTransform = 'capitalize';

      wrapper.appendChild(ghost);
      wrapper.appendChild(label);
      container.appendChild(wrapper);
    });

    return container;
  }
};

// Frightened ghost (blue)
export const Frightened: Story = {
  args: {
    type: 'blinky',
    state: 'frightened',
    lookDirection: 'right'
  }
};

// Flashing ghost (power ending warning)
export const Flashing: Story = {
  args: {
    type: 'blinky',
    state: 'flashing',
    lookDirection: 'right'
  }
};

// Eyes only (returning to ghost house)
export const EyesOnly: Story = {
  args: {
    type: 'blinky',
    state: 'eyes-only',
    lookDirection: 'right'
  }
};

// All states comparison
export const AllStates: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '40px';
    container.style.alignItems = 'center';
    container.style.padding = '20px';

    const states: GhostState[] = ['normal', 'frightened', 'flashing', 'eyes-only'];

    states.forEach(state => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '10px';

      const ghost = createGhost({ type: 'blinky', state, lookDirection: 'right' });
      ghost.style.position = 'relative';

      const label = document.createElement('span');
      label.textContent = state;
      label.style.color = '#fff';
      label.style.fontSize = '12px';

      wrapper.appendChild(ghost);
      wrapper.appendChild(label);
      container.appendChild(wrapper);
    });

    return container;
  }
};

// Eye directions
export const EyeDirections: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '40px';
    container.style.alignItems = 'center';
    container.style.padding = '20px';

    const directions: GhostLookDirection[] = ['right', 'down', 'left', 'up'];

    directions.forEach(direction => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '10px';

      const ghost = createGhost({ type: 'inky', state: 'normal', lookDirection: direction });
      ghost.style.position = 'relative';

      const label = document.createElement('span');
      label.textContent = `look ${direction}`;
      label.style.color = '#fff';
      label.style.fontSize = '12px';

      wrapper.appendChild(ghost);
      wrapper.appendChild(label);
      container.appendChild(wrapper);
    });

    return container;
  }
};

// Ghost in maze cell
export const InMazeCell: Story = {
  render: () => {
    const cell = document.createElement('div');
    cell.className = 'maze-cell maze-cell--path';
    cell.style.width = '20px';
    cell.style.height = '20px';
    cell.style.position = 'relative';
    cell.style.backgroundColor = '#000';

    const ghost = createGhost({ type: 'blinky', state: 'normal', lookDirection: 'left' });
    cell.appendChild(ghost);

    return cell;
  }
};
