import React from 'react';
import { render } from 'react-dom';
import shortid from 'shortid';
import { createBrowserHistory, Location } from 'history';
import List from './List';
import './index.css';

const history = createBrowserHistory();

const getListId = (location: Location) =>
  location.pathname.replace(/\//g, '').trim();

history.listen(location => {
  renderApp(location);
});

renderApp(history.location);

function renderApp(location: Location, el = document.getElementById('root')) {
  const listId = getListId(location);

  if (listId.trim() === '') {
    const storedId = window.localStorage.getItem('listId');
    if (storedId) {
      return history.push(storedId);
    }

    const generatedId = shortid.generate();
    window.localStorage.setItem('listId', generatedId);
    return history.push(generatedId);
  }

  render(<List listId={listId} />, el);
}
