import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Launch from '@material-ui/icons/Launch';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import {Link} from 'react-router-dom';
import {track} from '../../Analytics';

const styles = theme => ({
    pageWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    contentWrapper: {
        margin: '0 auto'
    },
    tagline: {
        textAlign: 'center'
    },
    logoWrapper: {
        margin: '0 auto',
        marginTop: '2em',
        textAlign: 'center',
        maxWidth: 400
    },
    paper: {
        margin: '2em',
    },
    tryButton: {
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    rightIcon: {
        marginLeft: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
    exampleImage: {
        height: 40,
        margin: theme.spacing(2),
    }
});

const tagline = 'API Designer';

const Examples = [
    {logo: 'github.png', link: 'github'},
    {logo: 'circleci.png', link: 'circleci'},
    {logo: 'jira.svg', link: 'jira'},
    {logo: 'stripe.svg', link: 'stripe'},
    {logo: 'launchdarkly.png', link: 'launchdarkly'},
    {logo: 'netlify.svg', link: 'netlify'},
    {logo: 'gitlab.svg', link: 'gitlab'},
]

const tryItOut = 'Try Optic';

class Welcome extends React.Component {

    componentDidMount() {
        track('Loaded Welcome');
    }

    render() {

        const {classes} = this.props;

        return (
            <div className={classes.pageWrapper}>
                <div className={classes.contentWrapper}>

                    <Grid container justify="center">
                        <Grid item sm={12} lg={6}>
                            <Paper className={classes.paper}>
                                <Grid container justify="center">
                                    <Grid item sm={12} lg={12}>
                                        <div className={classes.logoWrapper}>
                                            <img alt="Seamless Logo" src="/optic-logo-new.svg"/>
                                        </div>
                                        <Typography variant="h5" color="primary" className={classes.tagline}>{tagline}</Typography>
                                    </Grid>
                                </Grid>
                                <Grid container justify="center" style={{ textAlign: 'center', marginTop: 25 }}>
                                    <Grid item sm={12} xs={12}>
                                        <div style={{display: 'flex', padding: '.5em'}}>
                                            <Link to={'/upload-oas'} style={{flex: 1, textDecoration: 'none'}}>
                                                <Button variant="contained" color="secondary"
                                                        className={classes.tryButton}>
                                                    <CloudUploadIcon className={classes.leftIcon}/>
                                                    Upload OpenAPI/Swagger Spec
                                                </Button>
                                            </Link>
                                        </div>
                                    </Grid>
                                    <Grid item sm={12} xs={12}>
                                        <div style={{display: 'flex', padding: '.5em'}}>
                                            <Link to={'/new'} style={{flex: 1, textDecoration: 'none'}}>
                                                <Button variant="contained" color="secondary"
                                                        className={classes.tryButton}>
                                                    <Launch className={classes.leftIcon}/>
                                                    Start New API
                                                </Button>
                                            </Link>
                                        </div>
                                    </Grid>
                                </Grid>
                                <div style={{display: 'flex', justifyContent: 'center', padding: '1em'}}>
                                    <Typography variant="overline" color="primary">OR try it with one of these Popular
                                        APIs</Typography>
                                </div>
                                <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
                                    {Examples.map(i => (
                                        <Link to={`/examples/${i.link}`} onClick={() => {
                                            track('Loaded Example', {name: i.link});
                                        }}>
                                            <img className={classes.exampleImage} src={'/example-logos/' + i.logo}/>
                                        </Link>))}
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>

            </div>
        )
    }
}

export default withStyles(styles)(Welcome);
