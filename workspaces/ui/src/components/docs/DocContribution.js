import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { TextField, Typography } from '@material-ui/core';
import ReactMarkdown from 'react-markdown';
import { DocDarkGrey, DocSubHeading, SubHeadingStyles } from './DocConstants';
import { SymbolColor } from '../diff/v2/shape_viewers/styles';

export function MarkdownRender({ source, style, noHeadings }) {
  return (
    <div style={style}>
      <ReactMarkdown
        source={source}
        renderers={{
          heading: ({ level, children }) =>
            !noHeadings ? (
              <Typography
                color="primary"
                variant={`h${level}`}
                style={{ fontWeight: 300, marginBottom: 3 }}
              >
                {children}
              </Typography>
            ) : null,
          paragraph: ({ children }) => (
            <Typography
              variant="body2"
              style={{ fontWeight: 200, marginTop: 11, whiteSpace: 'pre-wrap' }}
            >
              {children}
            </Typography>
          ),
          list: ({ children }) => {
            return <ul style={{ paddingLeft: 20 }}>{children}</ul>;
          },
          listItem: ({ children }) => (
            <li style={{ paddingLeft: 0 }}>
              <Typography
                variant="body2"
                style={{
                  paddingLeft: 5,
                  paddingRight: 5,
                  marginTop: 11,
                  fontWeight: 200,
                }}
              >
                {children}
              </Typography>
            </li>
          ),
        }}
      />
    </div>
  );
}

export function FieldDescriptionMarkdownRender({ source, style }) {
  return (
    <div style={style}>
      <ReactMarkdown
        source={source}
        renderers={{
          paragraph: ({ children }) => (
            <Typography
              variant="body2"
              style={{
                fontWeight: 200,
                color: SymbolColor,
                whiteSpace: 'pre-wrap',
              }}
            >
              {children}
            </Typography>
          ),
          list: ({ children }) => {
            return (
              <ul style={{ paddingLeft: 20, color: SymbolColor }}>
                {children}
              </ul>
            );
          },
          listItem: ({ children }) => (
            <li style={{ paddingLeft: 0 }}>
              <Typography
                variant="body2"
                style={{
                  paddingLeft: 5,
                  paddingRight: 5,
                  color: SymbolColor,
                  fontWeight: 200,
                }}
              >
                {children}
              </Typography>
            </li>
          ),
        }}
      />
    </div>
  );
}

const styles = (theme) => ({
  root: {
    marginTop: 4,
    cursor: 'text',
  },
});

class _MarkdownContribution extends React.Component {
  state = {
    inputValue: this.props.value,
    editing: this.props.autoFocus,
  };

  handleChange = (e) => this.setState({ inputValue: e.target.value });
  setEditing = (b) => () => {
    this.setState({ editing: b });
    if (!b && this.props.onChange) {
      this.props.onChange(this.state.inputValue);
    }
  };

  render() {
    const { classes, label } = this.props;
    const { inputValue, editing } = this.state;
    if (editing) {
      return (
        <TextField
          label={label}
          fullWidth={true}
          multiline={true}
          style={{ fontSize: 11 }}
          value={inputValue}
          color="primary"
          autoFocus={true}
          onChange={this.handleChange}
          onBlur={this.setEditing(false)}
          margin="dense"
        />
      );
    } else {
      if (!inputValue) {
        return (
          <div className={classes.root} onClick={this.setEditing(true)}>
            <Typography
              variant="caption"
              style={{ color: DocDarkGrey, textTransform: 'uppercase' }}
            >
              {' '}
              + {label}
            </Typography>
          </div>
        );
      }

      return (
        <div className={classes.root} onClick={this.setEditing(true)}>
          <MarkdownRender source={inputValue} noHeadings={true} />
        </div>
      );
    }
  }
}

export const MarkdownContribution = withStyles(styles)(_MarkdownContribution);

class _HeadingContribution extends React.Component {
  state = {
    inputValue: this.props.value,
    editing: this.props.autoFocus,
  };

  handleChange = (e) => this.setState({ inputValue: e.target.value });
  setEditing = (b) => () => {
    this.setState({ editing: b });
    if (!b && this.props.onChange) {
      this.props.onChange(this.state.inputValue);
    }
  };

  render() {
    const { classes, label } = this.props;
    const { inputValue, editing } = this.state;

    if (editing) {
      return (
        <TextField
          label={label}
          fullWidth={true}
          value={inputValue}
          color="primary"
          autoFocus={true}
          onChange={this.handleChange}
          onBlur={this.setEditing(false)}
          margin="normal"
        />
      );
    } else {
      if (!inputValue) {
        return (
          <div className={classes.root} onClick={this.setEditing(true)}>
            <Typography
              variant="h5"
              style={{
                ...SubHeadingStyles,
                color: DocDarkGrey,
                textTransform: 'uppercase',
              }}
            >
              {' '}
              + {label}
            </Typography>
          </div>
        );
      }

      return (
        <DocSubHeading title={inputValue} onClick={this.setEditing(true)} />
      );
    }
  }
}

export const HeadingContribution = withStyles(styles)(_HeadingContribution);
