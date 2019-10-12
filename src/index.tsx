import React from 'react';
import { render } from 'react-dom';
import { createBrowserHistory, Location } from 'history';

import List from './List';
import './index.css';

const history = createBrowserHistory();

const getListId = (location: Location) => location.pathname.slice(1);

history.listen(location => {
  renderApp(location);
});

renderApp(history.location);

function renderApp(location: Location, el = document.getElementById('root')) {
  const listId = getListId(location);
  if (listId.trim() === '') {
    return render(<div>Nothing here</div>, el);
  }
  render(<List listId={listId} />, el);
}
