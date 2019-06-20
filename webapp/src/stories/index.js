import React from 'react';

import {storiesOf} from '@storybook/react';
import PathInput from '../components/path-editor/PathInput.js';
import BasicButton from '../components/shape-editor/BasicButton';
import {primary} from '../theme';
import ContributionTextField from '../components/contributions/ContributionTextField';
import {EditorModes} from '../contexts/EditorContext';
import {mui} from './MUI';

storiesOf('HTTP Requests')
    .add('Path Input (no existing routerPaths)', () => {
        return <PathInput/>
    })

storiesOf('Basic Button')
    .add('simple', () => {
        return <BasicButton color={primary}>Basic Button</BasicButton>
    })

storiesOf('Contribution Text Field')
    .add('heading documentation mode', mui((() => {
       return  <ContributionTextField value={'AppError'}
                                      mode={EditorModes.DOCUMENTATION}/>
    })()))
    .add('heading design mode', mui((() => {
        return  <ContributionTextField value={'AppError'}
                                       mode={EditorModes.DESIGN}/>
    })()))

    .add('single line documentation mode', mui((() => {
       return  <ContributionTextField value={'AppError'}
                                      variant={'inline'}
                                      mode={EditorModes.DOCUMENTATION}/>
    })()))
    .add('single line design mode', mui((() => {
        return  <ContributionTextField value={'AppError'}
                                       variant={'inline'}
                                       mode={EditorModes.DESIGN}/>
    })()))
    .add('multi line documentation mode', mui((() => {
       return  <ContributionTextField value={'AppError'}
                                      variant={'multi'}
                                      mode={EditorModes.DOCUMENTATION}/>
    })()))
    .add('multi line design mode', mui((() => {
        return  <ContributionTextField value={'AppError'}
                                       variant={'multi'}
                                       mode={EditorModes.DESIGN}/>
    })()))
