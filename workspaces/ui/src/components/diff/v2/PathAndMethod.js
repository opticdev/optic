import React from 'react';
import Typography from '@material-ui/core/Typography';
import {methodColorsDark} from '../../requests/DocConstants';

export const PathAndMethod = ({path, method}) => {

  const methodRender = <Typography variant="body" component="span" style={{
    fontWeight: 400,
    color: '#ffffff',
    padding: 4,
    fontSize: 11,
    borderRadius: 2,
    marginTop: -3,
    backgroundColor: methodColorsDark[method.toUpperCase()]
  }}>{method.toUpperCase()}</Typography>
  const pathRender = <Typography variant="subtitle1" component="span" style={{fontSize: 12, marginLeft: 7}}>{path}</Typography>;

  return (<span> {methodRender} {pathRender} </span>)
}

export const PathAndMethodLarge = ({path, method}) => {

  const methodRender = <Typography variant="body" component="span" style={{
    fontWeight: 400,
    color: '#ffffff',
    padding: 4,
    fontSize: 15,
    borderRadius: 2,
    marginTop: -3,
    backgroundColor: methodColorsDark[method.toUpperCase()]
  }}>{method.toUpperCase()}</Typography>
  const pathRender = <Typography variant="subtitle1" component="span" style={{fontSize: 17, marginLeft: 7}}>{path}</Typography>;

  return (<span> {methodRender} {pathRender} </span>)
}
