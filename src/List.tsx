import React, { FormEvent, useRef } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from './firebase';

function List({ listId }: { listId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, loading, error] = useCollection(
    db.collection(`lists/${listId}/items`).orderBy('order'),
    {
      snapshotListenOptions: { includeMetadataChanges: true }
    }
  );

  const handleToggleNeeded = (itemId: string) => async (e: any) => {
    db.collection(`lists/${listId}/items`)
      .doc(itemId)
      .update({
        needed: e.target.checked
      });
  };

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();

    const input = inputRef.current!;

    if (input.value.trim().length === 0) {
      return;
    }

    db.collection(`lists/${listId}/items`).add({
      name: input.value,
      order: input.value.toLowerCase(),
      needed: false
    });

    input.value = '';
  };

  if (loading) {
    return null;
  }

  if (error) {
    throw error;
  }

  return (
    <div>
      <header>
        <h1>Groceries</h1>
      </header>

      <main>
        <ul>
          {value &&
            value.docs.map(doc => {
              const item = doc.data();
              return (
                <li key={doc.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.needed}
                      onChange={handleToggleNeeded(doc.id)}
                    />{' '}
                    <span>{item.name}</span>
                  </label>
                </li>
              );
            })}
        </ul>

        <form onSubmit={handleAddItem} noValidate>
          <input ref={inputRef} type="text" placeholder="Legg til matvare" />
          <button type="submit" aria-label="Legg til">
            +
          </button>
        </form>
      </main>
    </div>
  );
}

export default List;
