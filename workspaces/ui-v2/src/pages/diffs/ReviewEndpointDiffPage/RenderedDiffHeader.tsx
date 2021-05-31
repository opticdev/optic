import React, { FC, useState } from 'react';

import { Collapse, IconButton, Typography } from '@material-ui/core';
import { ArrowLeft, ArrowRight, Menu as MenuIcon } from '@material-ui/icons';

import { EndpointName } from '<src>/components';
import { DiffHeader } from '../components/DiffHeader';
import { IEndpoint } from '<src>/hooks/useEndpointsHook';
import { IInterpretation } from '<src>/lib/Interfaces';

import { DiffLinks } from './DiffLinks';

export type RenderedDiffHeaderProps = {
  endpoint: IEndpoint;
  allDiffs: IInterpretation[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
};

export const RenderedDiffHeader: FC<RenderedDiffHeaderProps> = ({
  endpoint,
  allDiffs,
  currentIndex,
  setCurrentIndex,
}) => {
  const [showToc, setShowToc] = useState(false);

  return (
    <DiffHeader
      name={
        <EndpointName
          method={endpoint.method}
          fullPath={endpoint.fullPath}
          leftPad={0}
        />
      }
      secondary={
        <Collapse in={showToc}>
          <DiffLinks
            allDiffs={allDiffs}
            setSelectedDiffHash={(hash: string) => {
              const hashIndex = allDiffs.findIndex(
                (i) => i.diffDescription?.diffHash === hash
              );
              // findIndex possibly returns -1
              setCurrentIndex(Math.max(hashIndex, 0));
              setShowToc(false);
            }}
          />
        </Collapse>
      }
    >
      <IconButton
        size="small"
        color="primary"
        onClick={() => setCurrentIndex((prevIndex) => prevIndex - 1)}
        disabled={currentIndex === 0}
      >
        <ArrowLeft />
      </IconButton>
      <Typography variant="caption" color="textPrimary">
        ({currentIndex + 1}/{allDiffs.length})
      </Typography>
      <IconButton
        size="small"
        color="primary"
        onClick={() => setCurrentIndex((prevIndex) => prevIndex + 1)}
        disabled={allDiffs.length - 1 === currentIndex}
      >
        <ArrowRight />
      </IconButton>
      <IconButton
        size="small"
        color="primary"
        onClick={() => setShowToc(!showToc)}
      >
        <MenuIcon style={{ width: 20, height: 20 }} />
      </IconButton>
    </DiffHeader>
  );
};
