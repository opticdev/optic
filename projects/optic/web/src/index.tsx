import { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ChangelogPage } from './app/ChangelogPage';
import { ThemeProvider } from '@mui/system';
import theme from './app/constants';
// @ts-ignore
import decompress from 'brotli/decompress';
import { specToInternalInferVersion } from './app/utils';

const decodeHash = (data: string): any => {
  return JSON.parse(btoa(decompress(atob(data))));
};

const App = () => {
  const transformed = useMemo(() => {
    const decoded = decodeHash(window.location.hash);
    return {
      ...decoded,
      base: {
        original: decoded.base,
        internal: specToInternalInferVersion(decoded.base),
      },
      head: {
        original: decoded.head,
        internal: specToInternalInferVersion(decoded.head),
      },
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ChangelogPage
        base={transformed.base}
        head={transformed.head}
        results={transformed.results.results}
      />
    </ThemeProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
