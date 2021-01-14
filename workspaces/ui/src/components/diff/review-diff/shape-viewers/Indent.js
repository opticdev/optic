import React from 'react'

export const DepthContext = React.createContext({depth: 0});

export const Indent = ({children, add = 1, style}) => {
  return (
    <DepthContext.Consumer>
      {({depth}) => (
        <div style={{paddingLeft: (depth + add) * 13, ...style}}>
          <DepthContext.Provider value={{depth: depth + add}}>
            {children}
          </DepthContext.Provider>
        </div>
      )}
    </DepthContext.Consumer>
  );
};

export const IndentIncrement = ({children, add = 1}) => {
  return (
    <DepthContext.Consumer>
      {({depth}) => (
        <DepthContext.Provider value={{depth: depth + add}}>
          {children}
        </DepthContext.Provider>
      )}
    </DepthContext.Consumer>
  );
};
