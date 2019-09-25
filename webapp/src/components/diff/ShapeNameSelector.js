import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import FormControl from '@material-ui/core/FormControl';
import { Button } from '@material-ui/core';

class ShapeNameSelector extends React.Component {
    render() {
        const {expectedShapeId, actualShape} = this.props;
        const availableNames = [];
        const query = '';
        const matchingShapes = [];
        if (query === '') {
            // show any matching shapes (by shape) at the top

        } else {
            // show any matching shapes (by query) at the top
        }

        return (
            <Card>
                <CardHeader title={"Name new Shape or Choose existing Shape"} />
                <CardContent>
                    <FormControl></FormControl>
                </CardContent>
                <CardActions>
                    <Button onClick={this.handleExpectedShapeSet}>Set Shape</Button>
                    <Button onClick={this.nameObservedShape}>Set Name</Button>
                </CardActions>
            </Card>
        )
    }
}