import React from 'react';
import decorateTheme from '../decorators/theme';
// import {DiffHelperCard} from '../components/diff/v2/DiffHelperCard';

export default {
  title: 'Example story',
  decorators: [decorateTheme],
};

export function ExampleStory() {
  return (
    <div>
      <h3>Running story book again, themed!</h3>
    </div>
  );
}
