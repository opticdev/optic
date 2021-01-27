import React from 'react'
import {Paper} from '@material-ui/core';

export const LoomVideo = ({url}) => {
  return (
      <Paper elevation={2} style={{position: 'relative', paddingBottom: '62.5%', height: 0}}>
        <iframe src={url} frameBorder="0" webkitallowfullscreen
                mozallowfullscreen allowFullScreen
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}/>
      </Paper>
  )
}
