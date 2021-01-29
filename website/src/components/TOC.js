import React from 'react'
import useGlobalData from '@docusaurus/core/lib/client/exports/useGlobalData';

export function TOC(props) {
  const globalData = useGlobalData();

  const pages = globalData['docusaurus-plugin-content-docs']['default'].versions[0].docs
  const pagesInTOC = pages.filter(i => i.id.startsWith(props.kind+'/'))

  return (
    <>
      {pagesInTOC.map((i, index) => {
        return <h4 key={index}><a href={i.path}>{capitalizeFirstLetter(i.id.split('/').pop())}</a></h4>
      })}
    </>
  )
}


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
