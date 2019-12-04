import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import {track} from '../../Analytics';

const styles = theme => ({
    pageWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
});


class Welcome extends React.Component {

    componentDidMount() {
        track('Loaded Welcome');
    }

    render() {

        const {classes} = this.props;

        return (
            <div className={classes.pageWrapper}>
              <Button color="primary" href="https://docs.useoptic.com">Install Optic</Button>
            </div>
        )
    }
}

export default withStyles(styles)(Welcome);
