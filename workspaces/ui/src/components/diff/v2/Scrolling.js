import React from 'react'
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  scroll: {
    maxHeight: 575,
    width: '100%',
    overflow: 'scroll'
  }
}))

export default function ({children}) {

  const classes = useStyles()

  return (
    <div className={classes.scroll}>
      {children}
    </div>
  );

}
