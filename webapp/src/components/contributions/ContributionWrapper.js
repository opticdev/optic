import React from 'react';
import {withEditorContext} from '../../contexts/EditorContext.js';
import {withRfcContext} from '../../contexts/RfcContext.js';
import {updateContribution} from '../../engine/routines.js';
import ContributionTextField from './ContributionTextField.js';

class ContributionWrapper extends React.Component {
    handleSubmit = (value) => {
        const {contributionParentId, contributionKey, handleCommand} = this.props;
        handleCommand(updateContribution(contributionParentId, contributionKey, value))
    }

    render() {
        const {contributions, contributionParentId, contributionKey, ...rest} = this.props;
        const value = contributions.getOrUndefined(contributionParentId, contributionKey)

        return (
            <div>
                <ContributionTextField {...rest} value={value} onBlur={this.handleSubmit}/>
            </div>
        );
    }
}

export default withEditorContext(withRfcContext(ContributionWrapper));