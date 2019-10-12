import React, { useRef, FormEvent } from 'react';
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

function App({ listId }: { listId: string }) {
  const listIdRef = useRef<HTMLInputElement>(null);
  const handleNavigateToList = (e: FormEvent) => {
    e.preventDefault();
    history.push(listIdRef.current!.value);
  };

  return (
    <>
      <form onSubmit={handleNavigateToList} id="url-bar">
        <label htmlFor="list-id">Use List</label>
        <input id="list-id" ref={listIdRef} type="text" defaultValue={listId} />
      </form>

      <List listId={listId} />
    </>
  );
}

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

  window.localStorage.setItem('listId', listId);
  render(<App listId={listId} />, el);
}
