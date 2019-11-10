import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import {AddedGreen, AddedGreenBackground, UpdatedBlue, UpdatedBlueBackground} from '../../contexts/ColorContext';
import classNames from 'classnames';
import {MarkdownRender} from './DocContribution';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import BuildIcon from '@material-ui/icons/Build';
import Button from '@material-ui/core/Button';
import {Helmet} from 'react-helmet';
const styles = theme => ({
  root: {
    maxWidth: 790,
    margin: '0 auto',
    marginTop: 120
  },
  card: {
    borderLeft: `5px solid ${AddedGreen}`,
    backgroundColor: AddedGreenBackground,
    paddingLeft: 12,
    paddingTop: 5,
    paddingBottom: 20,
    fontSize: 14,
    marginRight: 10,
    marginTop: 13,
    paddingRight: 15,
    marginBottom: 13,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.secondary,
  },
  options: {
    marginTop: 22
  }
});

const source = `
## Finish Setting up Optic

##### Optic has not observed any API traffic yet. If you need help getting setup schedule a call with the maintainers!
`.trim()


class EmptySpec extends React.Component {
	render() {
	  const {classes} = this.props
		return (
		  <div className={classes.root}>
        <Helmet>
          <title>Finish Setting up Optic</title>
        </Helmet>
        <div className={classNames(classes.card)}>
          <MarkdownRender source={source} />
          <Grid container spacing={3} className={classes.options}>
            <Grid item xs={6}>
              <Paper className={classes.paper}>
                  <Button color="primary"
                          href="https://dashboard.useoptic.com/"
                          target="_blank"
                          startIcon={<BuildIcon color="primary" fontSize='large' />}>Read Getting Started Docs</Button>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.paper}>
                <Button color="primary"
                        href="https://calendly.com/optic-onboarding/30-min-session"
                        target="_blank"
                        startIcon={<BuildIcon color="primary" fontSize='large' />}>Setup a Free On-boarding Call</Button>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </div>
    )
	}
}

export default withStyles(styles)(EmptySpec)
