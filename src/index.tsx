import React, { useRef, FormEvent, useState } from 'react';
import { render } from 'react-dom';
import shortid from 'shortid';
import { createBrowserHistory, Location } from 'history';
import { useAuthState } from 'react-firebase-hooks/auth';
import List from './List';
import './index.css';
import { auth } from './firebase';
import 'firebase/auth';

function LogoutButton() {
  const logout = () => {
    auth().signOut();
  };

  return (
    <button onClick={logout} style={{ backgroundColor: '#b33939' }}>
      Logout
    </button>
  );
}

function Root({ listId }: { listId: string }) {
  const [user, loading, error] = useAuthState(auth());

  const login = () => {
    const provider = new auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    auth().signInWithPopup(provider);
  };

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      {user ? <App listId={listId} /> : <button onClick={login}>Login</button>}
    </>
  );
}

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
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 32
        }}
      >
        {editMode && <LogoutButton />}

        <button
          style={{ color: '#ddd', background: '#fff', marginTop: 16 }}
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
  render(<Root listId={listId} />, el);
}

const history = createBrowserHistory();

history.listen(location => {
  renderApp(location);
});

renderApp(history.location);
