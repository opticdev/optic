import React, { useEffect } from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { ICopyRender } from './ICopyRender';
import { ISuggestion } from '../../../lib/Interfaces';
import { makeStyles } from '@material-ui/styles';
import { Button, Zoom } from '@material-ui/core';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import classNames from 'classnames';
import { SubtleBlueBackground } from '../../theme';

type ISuggestionGroup = {
  suggestions: ISuggestion[];
  onApprove: (commands: any[]) => void;
  onSuggestionSelected: (commands: any[]) => void;
};

export function SuggestionGroup({
  suggestions,
  onApprove,
  onSuggestionSelected,
}: ISuggestionGroup) {
  const [value, setValue] = React.useState<number>(0);
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(event.target.value));
  };

  const onEnter = () => onApprove(suggestions[value].commands);

  useEffect(() => {
    if (suggestions[value]) {
      onSuggestionSelected(suggestions[value].commands);
    }
  }, [value]);

  return (
    <FormControl component="fieldset" style={{ width: '100%', marginLeft: 10 }}>
      <RadioGroup
        style={{ width: '100%' }}
        value={value}
        onChange={handleChange}
      >
        {suggestions.map((item, index) => {
          return (
            <FormControlLabel
              onKeyDown={(e: any) => {
                if (e.keyCode === 13) onEnter();
              }}
              className={classNames({ [classes.active]: value === index })}
              value={index}
              classes={{ label: classes.label }}
              control={
                <Radio
                  size="small"
                  onKeyDown={(e: any) => {
                    if (e.keyCode === 13) onEnter();
                  }}
                />
              }
              label={
                <div className={classes.labelGroup}>
                  <ICopyRender
                    variant="subtitle2"
                    copy={item.action.activeTense}
                  />
                  <div style={{ flex: 1 }} />
                  <Zoom in={value === index}>
                    <Button
                      color="primary"
                      size="small"
                      onKeyDown={(e: any) => {
                        if (e.keyCode === 13) onEnter();
                      }}
                      onClick={onEnter}
                      endIcon={<KeyboardArrowRightIcon size="small" />}
                    >
                      Apply
                    </Button>
                  </Zoom>
                </div>
              }
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
}
const useStyles = makeStyles((theme) => ({
  labelGroup: {
    display: 'flex',
    flexDirection: 'row',
    paddingRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    width: '100%',
  },
  active: {
    backgroundColor: SubtleBlueBackground,
    border: '1px solid #e2e2e2',
    boxSizing: 'content-box',
  },
}));
