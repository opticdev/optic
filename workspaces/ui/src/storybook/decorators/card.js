import React from 'react';
import { Card } from '@material-ui/core';

export default function card(story) {
  return <Card>{story()}</Card>;
}
