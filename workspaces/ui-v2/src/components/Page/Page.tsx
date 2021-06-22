import React, { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { Theme, makeStyles } from '@material-ui/core/styles';

import { FullPageLoader, FullPageError } from '../loaders';
import { TopNavigation } from '../navigation/TopNavigation';

/**
 * TODO - future enhancements for this components
 * - Include window.document.title logic here
 * - Move TopNavigation into `src/components/Page`
 */

const usePageStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
}));

const usePageBodyStyles = makeStyles<Theme, { padded?: boolean }>((theme) => ({
  content: ({ padded = true }) => ({
    display: 'flex',
    flexDirection: 'column', // default to vertical stacking of child elements by default
    flexGrow: 1,
    paddingLeft: padded ? theme.spacing(4) : 0,
    paddingRight: padded ? theme.spacing(4) : 0,
  }),
}));

type PageBodyProps = {
  padded?: boolean;
  style?: React.CSSProperties;
  className?: string;
  loading?: boolean;
  error?: boolean;
};

const PageBody: FC<PageBodyProps> = ({
  padded,
  style,
  children,
  className,
  loading,
  error,
}) => {
  const classes = usePageBodyStyles({ padded });

  return (
    <div className={classNames(classes.content, className)} style={style}>
      {loading ? <FullPageLoader /> : error ? <FullPageError /> : children}
    </div>
  );
};

type PageProps = {
  style?: React.CSSProperties;
  scrollToTop?: boolean;
  className?: string;
};

export const Page: FC<PageProps> & {
  Navbar: typeof TopNavigation;
  Body: typeof PageBody;
} = ({ style, children, scrollToTop, className }) => {
  const classes = usePageStyles();

  const { pathname } = useLocation();

  useEffect(() => {
    if (scrollToTop) {
      window.scrollTo(0, 0);
    }
  }, [pathname, scrollToTop]);

  return (
    <div className={classNames(classes.root, className)} style={style}>
      {children}
    </div>
  );
};

Page.Navbar = TopNavigation;
Page.Body = PageBody;
