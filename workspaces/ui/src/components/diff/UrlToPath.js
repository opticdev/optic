import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import {createStyles, makeStyles} from '@material-ui/styles';
import {primary} from '../../theme';

export function urlStringToPathComponents(url) {
  const components = url.split('/')
    .map((name, index) => {
      const isParameter = name.charAt(0) === ':' || name.charAt(0) === '{';
      return {index, name, originalName: name, isParameter};
    });
  const [root, ...rest] = components;
  if (root.name === '') {
    return rest;
  }
  return components;
}

const useStyles = makeStyles((theme) => createStyles({
  component: {
    fontWeight: 100,
    '&:hover': {
      color: '#cb5a77'
    }
  },
  pathComponent: {
    fontWeight: 600
  }
}));

function PathComponentItem(props) {
  const classes = useStyles()
  const {item, updateItem} = props;
  if (item.isParameter) {
    return (
      <ButtonBase
        onClick={() => updateItem({...item, isParameter: false})}
      >
        <Typography className={classes.pathComponent}>{`{${item.name}}`}</Typography>
      </ButtonBase>
    )
  }
  return (
    <ButtonBase onClick={() => updateItem({...item, isParameter: true})}>
      <Typography className={classes.component}>
        {item.name}
      </Typography>
    </ButtonBase>
  )
}

function UrlToPath(props) {
  const {url, onAccept} = props;
  const [pathComponents, setPathComponentsInternal] = useState(urlStringToPathComponents(url));

  function setPathComponents(pathComponents) {
    setPathComponentsInternal(pathComponents);
    onAccept(pathComponents)
  }

  useEffect(() => {
    onAccept(pathComponents)
  }, [])

  function setItemAt(index) {
    return function (newItem) {
      setPathComponents(pathComponents.map((item) => {
        if (item.index === index) {
          return newItem
        }
        return item
      }))
    }
  }

  const parameters = pathComponents.filter(x => x.isParameter)
  return (
    <div>
      <div style={{marginBottom: 6}}><Typography variant="caption">Click any path component to make it a parameter:</Typography></div>
      <div style={{display: 'flex', alignItems: 'center'}}>
        {
          pathComponents
            .map(item => [
              <ButtonBase disabled><Typography style={{marginRight: 2, marginLeft: 2, fontWeight: 200}}>/</Typography></ButtonBase>,
              <PathComponentItem item={item} updateItem={setItemAt(item.index)}/>
            ])
        }
      </div>
      {parameters.length > 0 ? (
        <div>
          <br/>
          <div><Typography variant="overline">Parameter Names:</Typography></div>
          {
            parameters.map(item => {
              const updater = setItemAt(item.index)
              return (
                <div style={{marginBottom: 11}}>
                  <TextField
                    fullWidth
                    value={item.name}
                    label={`"${item.originalName}" is an example of a...`}
                    onChange={(e) => updater({...item, name: e.target.value.trim()})}
                  >{item.name}</TextField>
                </div>
              )
            })}
        </div>
      ) : null}
    </div>
  );
}

UrlToPath.propTypes = {
  url: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired
};

export default UrlToPath;
