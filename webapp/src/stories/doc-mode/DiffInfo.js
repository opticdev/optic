import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import {AddedGreen, AddedGreenBackground, ChangedYellow, ChangedYellowBackground} from '../../contexts/ColorContext';
import {Typography} from '@material-ui/core';
import {MarkdownRender} from './DocContribution';
import classNames from 'classnames'
const styles = theme => ({
	card: {
    borderLeft: `5px solid ${AddedGreen}`,
    backgroundColor: AddedGreenBackground,
    paddingLeft: 12,
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: 14,
    marginRight: 10,
    marginTop: 13,
    marginBottom: 13,
	},
  green: {
    borderLeft: `5px solid ${AddedGreen}`,
    backgroundColor: AddedGreenBackground,
  },
  yellow: {
    borderLeft: `5px solid ${ChangedYellow}`,
    backgroundColor: ChangedYellowBackground,
  }
});

function DiffInfo({classes, title, description, color}) {

  const colorClass = color === 'green' ? classes.green : classes.yellow

  const source = `##### ${title}\n${description}`

  return (
    <div className={classNames(classes.card, colorClass)}>
      <MarkdownRender source={source} />
    </div>
  )
}

export default withStyles(styles)(DiffInfo)
