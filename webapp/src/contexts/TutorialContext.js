import {GenericContextFactory} from './GenericContextFactory';
import * as React from 'react';
import {track} from '../Analytics';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import TutorialDialog from '../components/tutorial/TutorialDialog';

const {
    Context: TutorialContext,
    withContext: withTutorialContext
} = GenericContextFactory(null)


class TutorialStore extends React.Component {

    state = {
        userCompletedTutorial: localStorage.getItem('_tutorial_completed')
    }

    tutorialCompleted() {
        localStorage.setItem('_tutorial_completed', 'true')
        this.setState({userCompletedTutorial: true})
    }

    render() {
        const showTutorial = !this.state.userCompletedTutorial
        const {isNew} = this.props
        const context = {
            showTutorial,
            isNew,
            tutorialCompleted: this.tutorialCompleted.bind(this)
        }

        return (
            <TutorialContext.Provider value={context}>
                {/*<TutorialDialog />*/}
                {this.props.children}
            </TutorialContext.Provider>
        )
    }
}

export {
    TutorialStore,
    TutorialContext,
    withTutorialContext
}

