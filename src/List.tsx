import React, { FormEvent, useRef } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from './firebase';
import Checkbox from './Checkbox';
import { ReactComponent as RemoveIcon } from './remove.svg';

type Props = {
  listId: string;
  editMode: boolean;
};

function List({ listId, editMode }: Props) {
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

    const normalized = input.value.toLowerCase();

    const existing = await db
      .collection(`lists/${listId}/items`)
      .where('order', '==', normalized)
      .get();

    if (existing.size === 0) {
      db.collection(`lists/${listId}/items`).add({
        name: input.value,
        order: normalized,
        needed: false
      });
    }

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
      <ul className="lists" style={{ minHeight: '100px' }}>
        {value &&
          value.docs
            .filter(doc => {
              if (editMode) {
                return true;
              }

              return !doc.data().needed;
            })
            .map(doc => {
              const item = doc.data();
              return (
                <li key={doc.id}>
                  <Checkbox
                    onChange={handleToggleNeeded(doc.id)}
                    checked={item.needed}
                  >
                    {item.name}
                  </Checkbox>

                  {editMode && (
                    <button
                      className="Button--delete"
                      onClick={handleDeleteItem(doc.id)}
                    >
                      <RemoveIcon style={{ width: 24, height: 24 }} />
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
          style={{ marginRight: 4 }}
        />
        <button type="submit">Add</button>
      </form>
    </main>
  );
}

export default List;
