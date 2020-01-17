import React from 'react'
import DiffPage from './DiffPage';

export function DocPageTesting() {

  return (<DiffPage
    url={'/users/aidan'}
    method={'put'}
    path={'/users/:userId'}
    observed={{
      statusCode: 200,
      requestBody: {example: true},
      responseBody: {responseExample: true}
    }}
    expected={{
      requestBodyShapeId: undefined,
      responseBodyShapeId: undefined
    }}
    remainingInteractions={2}
  />)
}
