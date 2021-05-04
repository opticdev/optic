import React from 'react';
import { IParsedLocation } from '../../../lib/Interfaces';
import { OpticBlueReadable, SubtleBlueBackground } from '../../theme';
//@ts-ignore
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

type IHighlightedLocation = {
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
}: IHighlightedLocation) {
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
