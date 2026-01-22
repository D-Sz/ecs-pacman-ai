import type { Meta, StoryObj } from '@storybook/html';
import { createPellet, type PelletProps, type PelletSize } from './Pellet';

const meta: Meta<PelletProps> = {
  title: 'Components/Pellet',
  tags: ['autodocs'],
  render: (args) => createPellet(args),
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the pellet'
    }
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

export default meta;
type Story = StoryObj<PelletProps>;

// Default pellet (small)
export const Default: Story = {
  args: {
    size: 'small'
  }
};

// Small pellet - standard game pellet
export const Small: Story = {
  args: {
    size: 'small'
  }
};

// Medium pellet - for emphasis or variations
export const Medium: Story = {
  args: {
    size: 'medium'
  }
};

// Large pellet - for testing/demonstration
export const Large: Story = {
  args: {
    size: 'large'
  }
};

// All sizes comparison
export const AllSizes: Story = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '40px';
    container.style.alignItems = 'center';
    container.style.padding = '20px';

    const sizes: PelletSize[] = ['small', 'medium', 'large'];
    sizes.forEach(size => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '10px';

      const pellet = createPellet({ size });
      pellet.style.position = 'relative';

      const label = document.createElement('span');
      label.textContent = size;
      label.style.color = '#fff';
      label.style.fontSize = '12px';

      wrapper.appendChild(pellet);
      wrapper.appendChild(label);
      container.appendChild(wrapper);
    });

    return container;
  }
};

// Pellet in a maze cell context
export const InMazeCell: Story = {
  render: () => {
    const cell = document.createElement('div');
    cell.className = 'maze-cell maze-cell--path';
    cell.style.width = '20px';
    cell.style.height = '20px';
    cell.style.position = 'relative';
    cell.style.backgroundColor = '#000';

    const pellet = createPellet({ size: 'small' });
    cell.appendChild(pellet);

    return cell;
  }
};
