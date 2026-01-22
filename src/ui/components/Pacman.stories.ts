import type { Meta, StoryObj } from '@storybook/html';
import { createPacman, type PacmanProps, type PacmanDirection } from './Pacman';

const meta: Meta<PacmanProps> = {
  title: 'Components/Pacman',
  tags: ['autodocs'],
  render: (args) => createPacman(args),
  argTypes: {
    direction: {
      control: { type: 'select' },
      options: ['right', 'left', 'up', 'down'],
      description: 'Direction Pacman is facing'
    },
    eating: {
      control: { type: 'boolean' },
      description: 'Whether Pacman is eating (mouth animation)'
    }
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

export default meta;
type Story = StoryObj<PacmanProps>;

// Default Pacman facing right
export const Default: Story = {
  args: {
    direction: 'right',
    eating: false
  }
};

// Pacman facing right
export const FacingRight: Story = {
  args: {
    direction: 'right',
    eating: false
  }
};

// Pacman facing left
export const FacingLeft: Story = {
  args: {
    direction: 'left',
    eating: false
  }
};

// Pacman facing up
export const FacingUp: Story = {
  args: {
    direction: 'up',
    eating: false
  }
};

// Pacman facing down
export const FacingDown: Story = {
  args: {
    direction: 'down',
    eating: false
  }
};

// Pacman eating animation
export const Eating: Story = {
  args: {
    direction: 'right',
    eating: true
  }
};

// All directions comparison
export const AllDirections: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '40px';
    container.style.alignItems = 'center';
    container.style.padding = '20px';

    const directions: PacmanDirection[] = ['right', 'down', 'left', 'up'];
    directions.forEach(direction => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '10px';

      const pacman = createPacman({ direction, eating: false });
      pacman.style.position = 'relative';

      const label = document.createElement('span');
      label.textContent = direction;
      label.style.color = '#fff';
      label.style.fontSize = '12px';

      wrapper.appendChild(pacman);
      wrapper.appendChild(label);
      container.appendChild(wrapper);
    });

    return container;
  }
};

// All directions with eating animation
export const AllDirectionsEating: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '40px';
    container.style.alignItems = 'center';
    container.style.padding = '20px';

    const directions: PacmanDirection[] = ['right', 'down', 'left', 'up'];
    directions.forEach(direction => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '10px';

      const pacman = createPacman({ direction, eating: true });
      pacman.style.position = 'relative';

      const label = document.createElement('span');
      label.textContent = `${direction} (eating)`;
      label.style.color = '#fff';
      label.style.fontSize = '12px';

      wrapper.appendChild(pacman);
      wrapper.appendChild(label);
      container.appendChild(wrapper);
    });

    return container;
  }
};

// Pacman in maze cell
export const InMazeCell: Story = {
  render: () => {
    const cell = document.createElement('div');
    cell.className = 'maze-cell maze-cell--path';
    cell.style.width = '20px';
    cell.style.height = '20px';
    cell.style.position = 'relative';
    cell.style.backgroundColor = '#000';

    const pacman = createPacman({ direction: 'right', eating: true });
    cell.appendChild(pacman);

    return cell;
  }
};

// Pacman moving through corridor (visual sequence)
export const MovementSequence: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '0';
    container.style.alignItems = 'center';
    container.style.padding = '20px';

    // Create a simple corridor
    for (let i = 0; i < 7; i++) {
      const cell = document.createElement('div');
      cell.className = 'maze-cell maze-cell--path';
      cell.style.width = '20px';
      cell.style.height = '20px';
      cell.style.position = 'relative';
      cell.style.backgroundColor = '#000';
      cell.style.border = '1px solid #333';

      // Add Pacman at position 3
      if (i === 3) {
        const pacman = createPacman({ direction: 'right', eating: true });
        cell.appendChild(pacman);
      }
      // Add pellets at other positions
      else if (i > 3) {
        const pellet = document.createElement('div');
        pellet.className = 'pellet pellet--small';
        cell.appendChild(pellet);
      }

      container.appendChild(cell);
    }

    return container;
  }
};
