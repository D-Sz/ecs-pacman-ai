import type { Meta, StoryObj } from '@storybook/html';
import { createPowerPellet, type PowerPelletProps } from './PowerPellet';

const meta: Meta<PowerPelletProps> = {
  title: 'Components/PowerPellet',
  tags: ['autodocs'],
  render: (args) => createPowerPellet(args),
  argTypes: {
    animated: {
      control: { type: 'boolean' },
      description: 'Whether the pellet pulses'
    }
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

export default meta;
type Story = StoryObj<PowerPelletProps>;

// Default power pellet (animated)
export const Default: Story = {
  args: {
    animated: true
  }
};

// Animated power pellet with pulsing effect
export const Animated: Story = {
  args: {
    animated: true
  }
};

// Static power pellet (no animation)
export const Static: Story = {
  args: {
    animated: false
  }
};

// Comparison: Power pellet vs regular pellet
export const ComparedToPellet: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '60px';
    container.style.alignItems = 'center';
    container.style.padding = '20px';

    // Regular pellet
    const pelletWrapper = document.createElement('div');
    pelletWrapper.style.display = 'flex';
    pelletWrapper.style.flexDirection = 'column';
    pelletWrapper.style.alignItems = 'center';
    pelletWrapper.style.gap = '10px';

    const pellet = document.createElement('div');
    pellet.className = 'pellet pellet--small';
    pellet.style.position = 'relative';

    const pelletLabel = document.createElement('span');
    pelletLabel.textContent = 'Regular Pellet';
    pelletLabel.style.color = '#fff';
    pelletLabel.style.fontSize = '12px';

    pelletWrapper.appendChild(pellet);
    pelletWrapper.appendChild(pelletLabel);

    // Power pellet
    const powerWrapper = document.createElement('div');
    powerWrapper.style.display = 'flex';
    powerWrapper.style.flexDirection = 'column';
    powerWrapper.style.alignItems = 'center';
    powerWrapper.style.gap = '10px';

    const powerPellet = createPowerPellet({ animated: true });
    powerPellet.style.position = 'relative';

    const powerLabel = document.createElement('span');
    powerLabel.textContent = 'Power Pellet';
    powerLabel.style.color = '#fff';
    powerLabel.style.fontSize = '12px';

    powerWrapper.appendChild(powerPellet);
    powerWrapper.appendChild(powerLabel);

    container.appendChild(pelletWrapper);
    container.appendChild(powerWrapper);

    return container;
  }
};

// Power pellet in maze cell context
export const InMazeCell: Story = {
  render: () => {
    const cell = document.createElement('div');
    cell.className = 'maze-cell maze-cell--path';
    cell.style.width = '20px';
    cell.style.height = '20px';
    cell.style.position = 'relative';
    cell.style.backgroundColor = '#000';

    const powerPellet = createPowerPellet({ animated: true });
    cell.appendChild(powerPellet);

    return cell;
  }
};

// Multiple power pellets (like corner positions)
export const FourCorners: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(2, 60px)';
    container.style.gap = '40px';
    container.style.padding = '20px';

    for (let i = 0; i < 4; i++) {
      const cell = document.createElement('div');
      cell.style.width = '60px';
      cell.style.height = '60px';
      cell.style.position = 'relative';
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';

      const powerPellet = createPowerPellet({ animated: true });
      powerPellet.style.position = 'relative';
      powerPellet.style.transform = 'none';

      cell.appendChild(powerPellet);
      container.appendChild(cell);
    }

    return container;
  }
};
