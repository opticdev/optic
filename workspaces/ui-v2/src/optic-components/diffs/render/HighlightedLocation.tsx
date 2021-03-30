import React from 'react';
import { IParsedLocation } from '../../../lib/Interfaces';
import { IRequestBody, IResponseBody } from '../../hooks/useEndpointBodyHook';
import {
  LightBlueBackground,
  OpticBlueLightened,
  OpticBlueReadable,
  SubtleBlueBackground,
  SubtleGreyBackground,
} from '../../theme';
//@ts-ignore
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';
import { makeStyles } from '@material-ui/styles';

type HighlightedLocation = {
  targetLocation?: IParsedLocation;
  statusCode?: number | undefined;
  contentType?: string | undefined;
  inRequest?: boolean | undefined;
  inResponse?: boolean | undefined;
  children: any;
};
export function HighlightedLocation({
  targetLocation,
  contentType,
  statusCode,
  inResponse,
  inRequest,
  children,
}: HighlightedLocation) {
  const matches: boolean = (() => {
    if (targetLocation && targetLocation.inRequest && inRequest) {
      return (
        targetLocation.inRequest.contentType === contentType &&
        Boolean(contentType)
      );
    }
    if (targetLocation && targetLocation.inResponse && inResponse) {
      return (
        targetLocation.inResponse.contentType === contentType &&
        targetLocation.inResponse.statusCode === statusCode
      );
    }
    return false;
  })();

  if (targetLocation && matches) {
    return (
      <ScrollIntoViewIfNeeded
        options={{
          behavior: 'smooth',
          scrollMode: 'if-needed',
        }}
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

  return <>{children}</>;
}
