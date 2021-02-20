import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
import reactSvgPlugin from 'vite-plugin-react-svg';

export default defineConfig({
  plugins: [
    reactRefresh(),
    reactSvgPlugin({
      defaultExport: 'component',
      svgo: true,
      expandProps: 'end'
    })
  ]
});
