import makeStyles from '@material-ui/styles/makeStyles';
import {
  AddedGreenBackground,
  ChangedYellowBackground,
  RemovedRedBackground,
} from '../theme';

export const useSharedStyles = makeStyles((theme) => ({
  shapeFont: {
    fontSize: '13',
    fontFamily: 'Ubuntu Mono',
    fontWeight: 400,
    color: sharedColor.fieldKeyColor,
  },
  valueFont: {
    fontSize: '13',
    fontFamily: 'Ubuntu Mono',
    fontWeight: 400,
  },
  symbolFont: {
    fontSize: '13',
    whiteSpace: 'pre',
    fontFamily: 'Ubuntu Mono',
    fontWeight: 400,
    color: sharedColor.colonColor,
  },
  added: {
    backgroundColor: `${AddedGreenBackground} !important`,
  },
  changed: {
    backgroundColor: `${ChangedYellowBackground} !important`,
  },
  removed: {
    backgroundColor: `${RemovedRedBackground} !important`,
  },
}));

export const sharedColor = {
  fieldKeyColor: '#6b7384',
  colonColor: '#a3acb9',
};

export const IndentSpaces = 10;
