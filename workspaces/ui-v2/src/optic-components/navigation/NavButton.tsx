import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { LightBlueBackground, OpticBlueReadable } from '../theme';
import { useBaseUrl } from '../hooks/useBaseUrl';
import { useHistory } from 'react-router-dom';

export type NavButtonProps = {
  Icon: React.ElementType;
  title: string;
  to: string;
};

export function NavButton(props: NavButtonProps) {
  const classes = useStyles();
  const { Icon, title, to } = props;

  const baseUrl = useBaseUrl();
  const history = useHistory();

  return (
    <div
      className={classes.root}
      onClick={() => {
        history.push(to);
      }}
    >
      <div className={classes.box}>
        <Icon className={classes.iconStyles} />
      </div>
      <Typography variant="subtitle2" className={classes.font}>
        {title}
      </Typography>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  box: {
    width: 15,
    height: 15,
    marginRight: 5,
  },
  font: {
    fontSize: 15,
    fontFamily: 'Ubuntu',
    color: OpticBlueReadable,
    fontWeight: 400,
    userSelect: 'none',
  },
  root: {
    display: 'inline-flex',
    height: 25,
    alignItems: 'center',
    borderRadius: 4,
    paddingLeft: 5,
    paddingRight: 5,
    marginRight: 10,
    paddingTop: 3,
    paddingBottom: 3,
    flexShrink: 1,
    flexBasis: 'auto',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: LightBlueBackground,
    },
  },
  iconStyles: {
    color: OpticBlueReadable,
    width: 15,
    height: 15,
  },
}));
