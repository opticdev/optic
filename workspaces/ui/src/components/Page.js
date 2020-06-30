import React, { useEffect, useContext, useState } from 'react';
import Navbar from './navigation/Navbar';
import { useLocation } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';

const PageContext = React.createContext(null);

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,
  },
  content: ({ padded = true }) => ({
    display: 'flex',
    flexDirection: 'column', // default to vertical stacking of child elements by default

    flexGrow: 1,
    paddingLeft: padded ? theme.spacing(4) : 0,
    paddingRight: padded ? theme.spacing(4) : 0,
  }),
}));

export default function Page(props) {
  const classes = useStyles();
  const pageContext = useState([]);
  usePageTitle(props.title, pageContext);

  const [pageTitles] = pageContext;
  const titles = pageTitles.filter((title) => !!title);
  const title = titles[titles.length - 1] || '';

  useEffect(() => {
    if (!document || !title) return;
    document.title = `${title} - Optic`;
  }, [title]);

  const { pathname } = useLocation();
  const scrollToTop = true; // change to be determined by page context

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname && scrollToTop]);

  return (
    <PageContext.Provider value={pageContext}>
      <ScrollToPosition />
      <div className={classes.root}>{props.children}</div>;
    </PageContext.Provider>
  );
}

function PageBody(props) {
  const classes = useStyles(props);

  return <div className={classes.content}>{props.children}</div>;
}

export function usePageTitle(title, injectedContext) {
  const context = useContext(PageContext) || injectedContext;

  useEffect(() => {
    if (!context) throw Error('usePageTitle must be used in context of a Page');
    const [titles, setTitles] = context;
    setTitles([...titles, title]);

    return () => {
      const index = titles.indexOf(title);
      setTitles(titles.slice(index, 1));
    };
  }, [title]);

  return title;
}



// enables scrolling to a specific position on the page - defaults to the top left (0, 0)

function ScrollToPosition({x = 0, y = 0}) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(x, y);
  }, [pathname]);

  return null;
}

// require the use of sub components in context of the Page, to nudge the use of them
// together (as that's the only way they really make sense)
Page.Navbar = Navbar;
Page.Body = PageBody;
