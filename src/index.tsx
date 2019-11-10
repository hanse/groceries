import React, { useRef, FormEvent, useState } from 'react';
import { render } from 'react-dom';
import shortid from 'shortid';
import { createBrowserHistory, Location } from 'history';
import List from './List';
import './index.css';

function App({ listId }: { listId: string }) {
  const listIdRef = useRef<HTMLInputElement>(null);
  const [editMode, setEditMode] = useState(false);

  const handleNavigateToList = (e: FormEvent) => {
    e.preventDefault();
    history.push(`/${listIdRef.current!.value}`);
  };

  return (
    <div className="App">
      <header>
        <h1>Groceries</h1>
        <button
          onClick={() => setEditMode(editMode => !editMode)}
          style={{
            background: 'white',
            textDecoration: 'underline',
            color: '#282828'
          }}
        >
          {editMode ? 'Done' : 'View All'}
        </button>
      </header>

      {editMode && (
        <form onSubmit={handleNavigateToList} id="url-bar">
          <label htmlFor="list-id">Use List</label>
          <input
            id="list-id"
            ref={listIdRef}
            type="text"
            defaultValue={listId}
          />
        </form>
      )}

      <List listId={listId} editMode={editMode} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 32
        }}
      >
        <button
          style={{ color: '#ddd', background: '#fff' }}
          onClick={() => window.location.reload(true)}
        >
          Reload
        </button>
      </div>
    </div>
  );
}

const getListId = (location: Location) =>
  location.pathname.replace(/\//g, '').trim();

function renderApp(location: Location, el = document.getElementById('root')) {
  const listId = getListId(location);

  if (listId.trim() === '') {
    const storedId = window.localStorage.getItem('listId');
    if (storedId) {
      return history.push(`/${storedId}`);
    }

    const generatedId = shortid.generate();
    window.localStorage.setItem('listId', generatedId);
    return history.push(`/${generatedId}`);
  }

  window.localStorage.setItem('listId', listId);
  render(<App listId={listId} />, el);
}

const history = createBrowserHistory();

history.listen(location => {
  renderApp(location);
});

renderApp(history.location);
