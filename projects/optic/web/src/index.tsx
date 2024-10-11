import { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ChangelogPage } from './app/ChangelogPage';
import { ThemeProvider } from '@mui/system';
import theme from './app/constants';
import { Buffer } from 'buffer';
// @ts-ignore
import decompress from 'brotli/decompress';
import { specToInternalInferVersion } from './app/utils';

const decodeHash = (data: string): any => {
  return JSON.parse(
    Buffer.from(decompress(Buffer.from(data, 'base64'))).toString()
  );
};

const App = () => {
  const transformed = useMemo(() => {
    // @ts-ignore
    const decoded = decodeHash(window.diffData || window.location.hash);
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
      <div
        style={{
          width: 1000,
          margin: 'auto',
        }}
      >
        <ChangelogPage
          base={transformed.base}
          head={transformed.head}
          results={transformed.results.results}
        />
      </div>
    </ThemeProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
