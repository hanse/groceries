import React, { useRef, FormEvent, useState, useEffect } from 'react';
import { render } from 'react-dom';
import shortid from 'shortid';
import { createBrowserHistory, Location } from 'history';
import { useAuthState } from 'react-firebase-hooks/auth';
import * as Sentry from '@sentry/browser';
import List from './List';
import './index.css';
import { auth } from './firebase';
import { ErrorBoundary, Button, Input, Stack } from '@devmoods/ui';
import 'firebase/auth';
import '@devmoods/ui/dist/styles.css';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN
  });
}

function onError(error: Error, errorInfo: any) {
  Sentry.withScope(scope => {
    scope.setExtras(errorInfo);
    Sentry.captureException(error);
  });
}

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

function AppLoader({ listId }: { listId: string }) {
  const [user, loading, error] = useAuthState(auth());

  if (loading) {
    return null;
  }

  if (error) {
    throw error;
  }

  if (user) {
    return <AuthenticatedApp listId={listId} />;
  }

  return <UnauthenticatedApp />;
}

function Root({ listId }: { listId: string }) {
  return (
    <ErrorBoundary onError={onError}>
      <AppLoader listId={listId} />
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
      <header style={{ padding: 16 }}>
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

function AuthenticatedApp({ listId }: { listId: string }) {
  const listIdRef = useRef<HTMLInputElement>(null);
  const [editMode, setEditMode] = useState(false);

  const handleNavigateToList = (e: FormEvent) => {
    e.preventDefault();
    history.push(`/${listIdRef.current!.value}`);
  };

  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (titleRef.current) {
        const active = (document.scrollingElement?.scrollTop || 0) > 50;
        titleRef.current.style.opacity = active ? '1.0' : '0.0';
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="App">
      <header>
        <Stack
          horizontal
          justifyContent="space-between"
          alignItems="center"
          paddingX={16}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            maxWidth: 'var(--app-width)',
            margin: '0 auto',
            background: 'white',
            paddingTop: 16,
            zIndex: 50000
          }}
        >
          <h1
            style={{ fontSize: 20, opacity: 0, transition: 'opacity 0.2s' }}
            ref={titleRef}
          >
            Groceries
          </h1>

          <Button
            onClick={() => setEditMode(editMode => !editMode)}
            variant="text"
          >
            {editMode ? 'Done' : 'View All'}
          </Button>
        </Stack>

        <Stack paddingX={16} style={{ marginTop: 60 }}>
          <h1>Groceries</h1>
        </Stack>
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
          <Stack spacing={8} alignItems="center">
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
