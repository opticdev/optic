import React, { useEffect } from 'react';
import Navbar from './navigation/Navbar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  content: {
    flex: 1
  }
}));

export default function Page(props) {
  const classes = useStyles();
  const title = props.title || 'Optic API Dashboard';

  useEffect(() => {
    if (!document) return;
    document.title = title;
  }, [title]);

  return <div className={classes.root}>{props.children}</div>;
}

function PageBody(props) {
  const classes = useStyles();

  return <div className={classes.content}>{props.children}</div>;
}

// require the use of sub components in context of the Page, to nudge the use of them
// together (as that's the only way they really make sense)
Page.Navbar = Navbar;
Page.Body = PageBody;
