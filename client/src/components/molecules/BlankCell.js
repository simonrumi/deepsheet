import React from 'react';

// reminder: useMemo is a HOC that only rerenders if the props - i.e. classes in this case - change
const BlankCell = React.memo(({ classes }) => <div className={classes} />);

export default BlankCell;