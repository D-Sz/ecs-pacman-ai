import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials'
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {}
  },
  staticDirs: ['../public'],
  typescript: {
    check: true
  }
};

export default config;
