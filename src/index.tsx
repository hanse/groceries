import React, { useRef, FormEvent, useState } from 'react';
import { render } from 'react-dom';
import shortid from 'shortid';
import { createBrowserHistory, Location } from 'history';
import { useAuthState } from 'react-firebase-hooks/auth';
import List from './List';
import './index.css';
import { auth } from './firebase';
import ErrorBoundary from './ErrorBoundary';
import { Button, Input, Stack } from '@devmoods/ui';
import 'firebase/auth';
import '@devmoods/ui/dist/styles.css';

function LogoutButton() {
  const logout = () => {
    auth().signOut();
  };

  return (
    <Button onClick={logout} style={{ backgroundColor: '#b33939' }}>
      Logout
    </Button>
  );
}

function Root({ listId }: { listId: string }) {
  const [user, loading, error] = useAuthState(auth());

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
    <ErrorBoundary>
      {user ? <App listId={listId} /> : <UnauthenticatedApp />}
    </ErrorBoundary>
  );
}

function UnauthenticatedApp() {
  const login = () => {
    const provider = new auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    auth().signInWithPopup(provider);
  };

  return (
    <div className="App">
      <header>
        <h1>Groceries</h1>
      </header>

      <Stack as="main" padding={16} spacing={32} alignItems="flex-start">
        <img
          src="https://raw.githubusercontent.com/hanse/groceries/master/screenshots/compact.png"
          alt=""
          width={150}
          style={{ transform: 'rotate(5deg)', alignSelf: 'center' }}
        />
        <div>
          <strong>
            Real-time <em>collaborative</em> grocery lists.
          </strong>{' '}
          The easiest way to manage shopping with your partner.
        </div>
        <Button onClick={login}>Get Started with Google</Button>
      </Stack>
    </div>
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
        <Button
          onClick={() => setEditMode(editMode => !editMode)}
          variant="text"
        >
          {editMode ? 'Done' : 'View All'}
        </Button>
      </header>

      <Stack as="main" padding={16} spacing={32}>
        {editMode && (
          <form onSubmit={handleNavigateToList}>
            <Input
              ref={listIdRef}
              type="text"
              defaultValue={listId}
              startAdornment="https://.../"
            />
          </form>
        )}

        <List listId={listId} editMode={editMode} />

        {editMode && (
          <Stack spacing={8} alignItems="center" style={{ marginTop: 32 }}>
            <LogoutButton />
            <Button variant="text" onClick={() => window.location.reload(true)}>
              Reload
            </Button>
          </Stack>
        )}
      </Stack>
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
