import { makeStyles } from '@material-ui/core/styles';

export const useCodeInputStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    fontWeight: 800,
    fontFamily: 'Ubuntu Mono',
  },
  iconButton: {
    padding: 10,
    opacity: 0.6,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));
