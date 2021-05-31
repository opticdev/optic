import React, { FC } from 'react';
import { DiffHeader } from '<src>/pages/diffs/components/DiffHeader';
import {
  Box,
  Button,
  Checkbox,
  Switch,
  TextField,
  Typography,
} from '@material-ui/core';
import { CheckboxState } from '../hooks';

type AddEndpointDiffHeaderProps = {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  bulkMode: boolean;
  setBulkMode: React.Dispatch<React.SetStateAction<boolean>>;
  numberOfUnmatchedUrl: number;
  numberOfVisibleUrls: number;
  numberOfSelectedUrls: number;
  checkboxState: CheckboxState;
  toggleSelectAllCheckbox: () => void;
  setShowBulkModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AddEndpointDiffHeader: FC<AddEndpointDiffHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  bulkMode,
  setBulkMode,
  numberOfUnmatchedUrl,
  numberOfVisibleUrls,
  numberOfSelectedUrls,
  checkboxState,
  toggleSelectAllCheckbox,
  setShowBulkModal,
}) => {
  const secondary = bulkMode && (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      padding="8px 0"
      justifyContent="space-between"
    >
      <Button
        variant="contained"
        color="primary"
        size="small"
        disabled={numberOfSelectedUrls === 0}
        onClick={() => {
          setShowBulkModal(true);
        }}
      >
        Learn {numberOfSelectedUrls} Endpoints
      </Button>
      <Box display="flex" flexDirection="row" alignItems="center">
        <Typography
          color="primary"
          component="div"
          style={{
            fontWeight: 600,
            fontSize: 12,
            paddingLeft: 5,
            fontFamily: 'Ubuntu',
          }}
        >
          {numberOfSelectedUrls} selected urls
        </Typography>
        <Checkbox
          checked={checkboxState !== CheckboxState.NotChecked}
          indeterminate={checkboxState === CheckboxState.Indeterminate}
          onChange={toggleSelectAllCheckbox}
        />
      </Box>
    </Box>
  );

  return (
    <DiffHeader
      name={`${numberOfUnmatchedUrl} unmatched URLs observed${
        numberOfVisibleUrls !== numberOfUnmatchedUrl
          ? `. Showing ${numberOfVisibleUrls}`
          : ''
      }`}
      secondary={secondary}
    >
      <Box display="flex" flexDirection="row">
        <TextField
          size="small"
          value={searchQuery}
          inputProps={{ style: { fontSize: 10, width: 140 } }}
          placeholder="filter urls"
          onChange={(e) => {
            const newValue = e.target.value.replace(/\s+/g, '');
            if (!newValue.startsWith('/')) {
              setSearchQuery('/' + newValue);
            } else {
              setSearchQuery(newValue);
            }
          }}
        />
        <div style={{ marginLeft: 13 }}>
          <Typography
            variant="subtitle2"
            component="span"
            color="primary"
            style={{ fontWeight: 600, fontSize: 11 }}
          >
            {' '}
            bulk mode
          </Typography>
          <Switch
            value={bulkMode}
            onChange={(e: any) => setBulkMode(e.target.checked)}
            color="primary"
            size="small"
          />{' '}
        </div>
      </Box>
    </DiffHeader>
  );
};
