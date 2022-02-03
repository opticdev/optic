import { fragmentize } from '../../../services/diff/differs/url-path-diff';
import niceTry from 'nice-try';

export function tabInPath(pattern: string, targetUrl: string) {
  const targetFragments = fragmentize(targetUrl).filter((i) => i !== '');
  const inputFragments = (niceTry(() => fragmentize(pattern)) || []).filter(
    (i) => i !== ''
  );

  if (targetFragments.length > inputFragments.length) {
    const newFragment = targetFragments[inputFragments.length];

    return '/' + [...inputFragments, newFragment].join('/');
  }
  return pattern;
}
