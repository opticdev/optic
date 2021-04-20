import { makeStyles } from '@material-ui/styles';
import { AddedGreen } from '../theme';

export const useChangelogStyles = makeStyles(() => ({
  added: {
    backgroundColor: `rgba(0,196,70,0.2)`,
    borderLeft: `2px solid ${AddedGreen}`,
  },
}));
