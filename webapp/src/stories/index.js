import React from 'react';

import {storiesOf} from '@storybook/react';
import PathInput from '../components/path-editor/PathInput.js';

storiesOf('HTTP Requests')
    .add('Path Input (no existing paths)', () => {
        return <PathInput/>
    })