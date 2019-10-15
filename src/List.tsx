import React, { FormEvent, useRef } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from './firebase';

type Props = {
  listId: string;
  showDeleteButtons: boolean;
};

function List({ listId, showDeleteButtons }: Props) {
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

  const handleDeleteItem = (itemId: string) => async (e: any) => {
    db.collection(`lists/${listId}/items`)
      .doc(itemId)
      .delete();
  };

  if (error) {
    throw error;
  }

  return (
    <main>
      {loading && (
        <div className="Loader">
          <div className="spinner">
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
        </div>
      )}
      <ul className="lists" style={{ minHeight: '50vh' }}>
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

                {showDeleteButtons && (
                  <button
                    className="Button--delete"
                    onClick={handleDeleteItem(doc.id)}
                  >
                    Delete
                  </button>
                )}
              </li>
            );
          })}
      </ul>

      <form className="Form--addItem" onSubmit={handleAddItem} noValidate>
        <input
          ref={inputRef}
          type="text"
          placeholder="Milk, cheese, apples etc."
        />
        <button type="submit">Add</button>
      </form>
    </main>
  );
}

export default List;
