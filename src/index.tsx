import 'firebase/auth';
import '@devmoods/ui/dist/styles.css';
import '@devmoods/ui/dist/global.css';

import './index.css';

import {
  Button,
  ErrorBoundary,
  Input,
  Stack,
  ThemeProvider,
  createTheme
} from '@devmoods/ui';
import * as Sentry from '@sentry/browser';
import { Location, createBrowserHistory } from 'history';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { render } from 'react-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import shortid from 'shortid';

import { auth } from './firebase';
import image from './image.png';
import List from './List';

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
    <Button onClick={logout} color="#b33939">
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

const theme = createTheme({
  colors: {
    primary: '#454545',
    formsBorderRadius: '6px',
    formsBorderWidth: '0px',
    formsBackground: '#f2f2f2',
    formsBackgroundHover: '#f0f0f0'
  }
});

function Root({ listId }: { listId: string }) {
  return (
    <ErrorBoundary onError={onError}>
      <ThemeProvider theme={theme}>
        <AppLoader listId={listId} />
      </ThemeProvider>
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
    <div className="App" style={{ position: 'relative' }}>
      <header style={{ padding: 16, marginTop: 100 }}>
        <h1 style={{ fontSize: 48 }}>Groceries</h1>
      </header>

      <Stack as="main" padding="m" spacing="l" alignItems="flex-start">
        <img
          src={image}
          alt=""
          height={250}
          style={{
            transform: 'rotate(5deg) translateY(-50%)',
            alignSelf: 'center',
            position: 'absolute',
            right: 0,
            userSelect: 'none',
            zIndex: -1
          }}
        />
        <div style={{ paddingRight: 120 }}>
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
      requestAnimationFrame(() => {
        if (titleRef.current) {
          const active = (document.scrollingElement?.scrollTop || 0) >= 40;
          titleRef.current.style.opacity = active ? '1.0' : '0.0';
        }
      });
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
          paddingX="m"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            maxWidth: 'var(--app-width)',
            margin: '0 auto',
            background: 'white',
            height: 84,
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

        <h1 className="big-heading">Groceries</h1>
      </header>

      <Stack as="main" paddingX="m" spacing="l" style={{ paddingBottom: 64 }}>
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
          <Stack spacing="s" alignItems="center">
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

history.listen(({ location }) => {
  renderApp(location);
});

renderApp(history.location);
