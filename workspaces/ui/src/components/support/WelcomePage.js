import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import EmptyState from './EmptyState';

const useStyles = makeStyles((theme) => ({
  body: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh'
  }

}));

export default function WelcomePage(props) {
  const classes = useStyles();
  const {title, content} = props

  return (
    <div className={classes.body}>
      <div style={{marginTop: -150}}>
      <EmptyState title={"Optic is Monitoring your APIs"}
content={`
**Getting Started**
- [Add Optic to your API](https://google.com)
- [Document your API with Optic](https://google.com)
- [Monitor Live Traffic with Optic](https://google.com)
`.trim()}/>
      </div>
    </div>
  )

}
