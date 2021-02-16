import makeStyles from '@material-ui/styles/makeStyles';

export const useFeatureStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  centeredImagineContainer: {
    padding: 40,
    textAlign: 'center',
  },
  inlineImage: {
    maxHeight: 500,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  highlights: {
    marginTop: 140,
    alignItems: 'flex-start',
    alignContent: 'flex-start',
  },
  mini: {
    fontWeight: 100,
    color: '#6d757d',
    fontFamily: 'Ubuntu Mono',
    fontSize: 18,
    marginBottom: -2,
  },
  headline: {
    fontWeight: 600,
    fontFamily: 'Inter',
  },
  transparentCard: {
    padding: 12,
  },
  subtext: {
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 700,
    fontWeight: 400,
    fontFamily: 'Inter',
    color: '#586069',
    fontSize: 20,
  },
  subtextLeft: {
    marginTop: 10,
    textAlign: 'left',
    fontWeight: 600,
    fontFamily: 'Inter',
    color: '#586069',
    fontSize: 20,
  },
  subtextDark: {
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 700,
    fontWeight: 400,
    fontFamily: 'Inter',
    color: 'black',
    fontSize: 20,
  },
  highlightHeader: {
    fontWeight: 800,
    fontFamily: 'Inter',
    fontSize: 17,
    marginTop: 30,
  },
  highlightSubtext: {
    color: '#5a5e65',
    fontSize: 16,
    fontWeight: 500,
  },
  darkBg: {
    backgroundColor: '#f5f5f5',
    paddingTop: 30,
    paddingBottom: 30,
    borderTop: '1px solid #e2e2e2',
    borderBottom: '1px solid #e2e2e2',
  },
  descriptions: {
    color: '#586069',
    fontWeight: 300,
    fontSize: 18,
    marginTop: 12,
    fontFamily: 'Inter',
    marginBottom: 50,
    textAlign: 'left',
  },
  highlightSpan: {
    fontWeight: 300,
    background: `linear-gradient(180deg,rgba(255,255,255,0) 50%, rgba(43,123,209,.24) 50%)`,
  },
  bgTexture: {
    backgroundImage: `url(${require('../../static/img/agsquare_dark_@2X.png')})`,
    backgroundSize: '100px 100px',
  },
});
