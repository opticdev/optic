import React, { FC } from 'react';
import { DiffLocation } from '<src>/lib/parse-diff';
import { OpticBlueReadable, SubtleBlueBackground } from '<src>/styles';
//@ts-ignore
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';
import { makeStyles } from '@material-ui/core';
import classnames from 'classnames';

type IHighlightedLocation =
  | {
      targetLocation?: DiffLocation;
      statusCode?: undefined;
      contentType?: undefined;
      expectedLocation: Location.Query;
    }
  | {
      targetLocation?: DiffLocation;
      statusCode?: undefined;
      contentType: string;
      expectedLocation: Location.Request;
    }
  | {
      targetLocation?: DiffLocation;
      statusCode: number;
      contentType: string;
      expectedLocation: Location.Response;
    };

export enum Location {
  Request,
  Response,
  Query,
}

export const HighlightedLocation: FC<
  IHighlightedLocation & React.HtmlHTMLAttributes<HTMLDivElement>
> = (props) => {
  const { targetLocation, children } = props;
  const classes = useStyles();
  const matches: boolean = (() => {
    if (!targetLocation) {
      return false;
    }

    switch (props.expectedLocation) {
      case Location.Request:
        return (
          targetLocation.getRequestDescriptor()?.contentType ===
          props.contentType
        );
      case Location.Response:
        return (
          targetLocation.getResponseDescriptor()?.contentType ===
            props.contentType &&
          targetLocation.getResponseDescriptor()?.statusCode ===
            props.statusCode
        );
      case Location.Query:
        return targetLocation.isQueryParameter();
      default:
        return false;
    }
  })();

  if (targetLocation && matches) {
    return (
      <ScrollIntoViewIfNeeded
        options={{
          behavior: 'smooth',
          scrollMode: 'if-needed',
        }}
        className={classnames(
          classes.base,
          classes.highlighted,
          props.className
        )}
        style={{
          width: '100%',
          borderLeft: `2px solid ${OpticBlueReadable}`,
          padding: 15,
          backgroundColor: SubtleBlueBackground,
        }}
      >
        {children}
      </ScrollIntoViewIfNeeded>
    );
  }

  return (
    <div className={classnames(classes.base, props.className)}>{children}</div>
  );
};

const useStyles = makeStyles((theme) => ({
  highlighted: {
    borderLeft: `2px solid ${OpticBlueReadable}`,
    padding: 15,
    backgroundColor: SubtleBlueBackground,
  },
  base: {
    width: '100%',
  },
}));
