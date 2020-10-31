import React from 'react';
import theme from '../../decorators/theme';
import { CircularDiffProgress } from './CircularDiffProgress';

export default {
  title: 'Diff Page/circular progress',
  decorators: [theme],
};

export function CircularProgressBoard() {
  return (
    <div style={{ padding: 50 }}>
      <CircularDiffProgress handled={3} total={5} />
      <CircularDiffProgress handled={0} total={1} />
      <CircularDiffProgress handled={2} total={5} />
      <CircularDiffProgress handled={4} total={5} />
      <CircularDiffProgress handled={27} total={27} />
    </div>
  );
}
