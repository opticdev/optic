import React from 'react'

export function DocContributors({githubUsernames}) {
  return (
    <div style={{marginTop: 100, color: 'rgb(120,120,120)'}}>Contributions to this article from: {' '}
      {githubUsernames.map(i => <a target="_blank" href={`https://github.com/`+i}>@{i}{' '}</a>)}</div>
  )
}
