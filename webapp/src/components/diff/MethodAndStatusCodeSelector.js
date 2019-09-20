import React from 'react';
import { methodChoices } from '../PathPage';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';

class MethodAndStatusCodeSelector extends React.Component {
    state = {
        selections: this.props.initialSelections
    }

    componentDidMount() {
        this.props.onChange(this.state.selections)
    }

    handleChange = (selection) => (e, checked) => {
        const { method, statusCode } = selection;
        const selections = checked ? (
            [...this.state.selections, { method, statusCode }]
        ) : (
                this.state.selections
                    .filter(x => !(x.method === method && x.statusCode === statusCode))
            )
        this.setState({
            selections
        })
        this.props.onChange(selections)
    }

    render() {
        const { selections } = this.state;
        const selectedStatusCodes = [...new Set(selections.map(x => x.statusCode))].sort()
        const methodItems = methodChoices
            .map(method => {
                const selectedStatusCodesForMethod = selections
                    .filter(selection => selection.method === method)
                    .reduce((acc, selection) => {
                        acc.add(selection.statusCode)
                        return acc
                    }, new Set())

                return (
                    <div key={method}>
                        <Typography variant="h5">{method}</Typography>
                        <div style={{ display: 'flex' }}>
                            {selectedStatusCodes.map(statusCode => {
                                const checked = selectedStatusCodesForMethod.has(statusCode)
                                return (
                                    <div>
                                        <Checkbox
                                            key={statusCode}
                                            checked={checked}
                                            onChange={this.handleChange({ method, statusCode })}
                                        />
                                        {statusCode}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })
        return (
            <div>
                {methodItems}
            </div>
        )
    }
}

export default MethodAndStatusCodeSelector