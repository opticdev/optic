import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import {AddedGreen, AddedGreenBackground} from '../../contexts/ColorContext';
import classNames from 'classnames';
import {MarkdownRender} from '../requests/DocContribution';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
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
#### Document your API
To get started, click on the notifications bar above. Optic will guide you through the process of documenting your API. 
`.trim()


class EmptySpecWithSession extends React.Component {
	render() {
	  const {classes} = this.props
		return (
		  <div className={classes.root}>
        <div className={classNames(classes.card)}>
          <MarkdownRender source={source} />
        </div>
      </div>
    )
	}
}

export default withStyles(styles)(EmptySpecWithSession)
