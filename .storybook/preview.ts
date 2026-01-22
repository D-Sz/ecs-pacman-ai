import type { Preview } from '@storybook/html';
import '../src/ui/styles/game.css';
import '../src/ui/styles/maze.css';
import '../src/ui/styles/characters.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#000000' },
        { name: 'maze', value: '#000033' }
      ]
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
