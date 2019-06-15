import React from 'react';

import {storiesOf} from '@storybook/react';
import PathInput from '../components/path-editor/PathInput.js';
import BasicButton from '../components/shape-editor/BasicButton';
import {primary} from '../theme';

storiesOf('HTTP Requests')
    .add('Path Input (no existing paths)', () => {
        return <PathInput/>
    })

storiesOf('Basic Button')
    .add('simple', () => {
        return <BasicButton color={primary}>Basic Button</BasicButton>
    })
