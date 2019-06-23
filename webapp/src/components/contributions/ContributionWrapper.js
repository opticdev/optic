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
        const {cachedQueryResults, contributionParentId, contributionKey, defaultText, onClick, ...rest} = this.props;
        const {contributions} = cachedQueryResults

        const value = contributions.getOrUndefined(contributionParentId, contributionKey)

        return (
            <div>
                <ContributionTextField key={`${contributionParentId}-${contributionKey}`} {...rest} value={value} defaultText={defaultText} onClick={onClick} onBlur={this.handleSubmit}/>
            </div>
        );
    }
}

export default withEditorContext(withRfcContext(ContributionWrapper));
