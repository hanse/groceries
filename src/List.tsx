import { Button, Checkbox, Input, Stack } from '@devmoods/ui';
import React, { FormEvent, useRef, useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';

import { db } from './firebase';
import { ReactComponent as RemoveIcon } from './remove.svg';

type Props = {
  listId: string;
  editMode: boolean;
};

function List({ listId, editMode }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [adding, setAdding] = useState(false);
  const [value, loading, error] = useCollection(
    db.collection(`lists/${listId}/items`).orderBy('order'),
    {
      snapshotListenOptions: { includeMetadataChanges: true }
    }
  );

  const handleToggleNeeded = (itemId: string) => async (e: any) => {
    db.collection(`lists/${listId}/items`).doc(itemId).update({
      needed: !e.target.checked
    });
  };

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();

    const input = inputRef.current!;

    if (input.value.trim().length === 0) {
      return;
    }

    const name = input.value.trim();
    const order = name.toLowerCase();

    setAdding(true);

    const existing = await db
      .collection(`lists/${listId}/items`)
      .where('order', '==', order)
      .get();

    if (existing.size === 0) {
      await db.collection(`lists/${listId}/items`).add({
        name,
        order,
        needed: true
      });
    } else {
      existing.forEach(doc => {
        db.collection(`lists/${listId}/items`).doc(doc.id).update({
          needed: true
        });

        if (!listRef.current) {
          return;
        }

        const item = listRef.current!.querySelector(
          `[data-name=${doc.data().order}]`
        );

        if (item != null) {
          const classList = item.classList;
          classList.add('highlight');
          setTimeout(() => classList.remove('highlight'), 300);
        }
      });
    }
    setAdding(false);
    input.value = '';
  };

  const handleDeleteItem = (itemId: string) => async (e: any) => {
    db.collection(`lists/${listId}/items`).doc(itemId).delete();
  };

  if (error) {
    throw error;
  }

  const docs = value
    ? value.docs.filter((doc: any) => {
        if (editMode) {
          return true;
        }

        return !!doc.data().needed;
      })
    : [];

  return (
    <>
      {loading && (
        <ul className="lists skeleton" style={{ minHeight: '100px' }}>
          {Array(10)
            .fill(undefined)
            .map((_, i) => (
              <li key={i}>
                <span>{i}</span>
              </li>
            ))}
        </ul>
      )}
      {!loading && docs.length === 0 ? (
        <div
          style={{
            padding: 20,
            textAlign: 'center',
            color: '#333'
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8, fontWeight: 500 }}>
            Done{' '}
            <span role="img" aria-label="clap">
              👏
            </span>
          </div>
          <div>You have no more stuff to pick up today.</div>
        </div>
      ) : (
        <ul className="lists" ref={listRef}>
          {docs.map((doc: any) => {
            const item = doc.data();
            return (
              <li key={doc.id} data-name={item.order}>
                <Checkbox
                  style={{
                    ['--Checkbox-color' as any]: '#eee',
                    ['--Checkbox-checkColor' as any]: '#777'
                  }}
                  onChange={handleToggleNeeded(doc.id)}
                  checked={!item.needed}
                >
                  <span
                    style={{
                      fontWeight: item.needed ? 600 : 400,
                      textDecoration: item.needed ? 'none' : 'line-through',
                      marginTop: -2,
                      display: 'block'
                    }}
                  >
                    {item.name}
                  </span>
                </Checkbox>

                {editMode && (
                  <Button
                    intent="danger"
                    variant="text"
                    className="Button--delete"
                    onClick={handleDeleteItem(doc.id)}
                  >
                    <RemoveIcon style={{ width: 24, height: 24 }} />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Stack
        as="form"
        onSubmit={handleAddItem}
        noValidate
        horizontal
        alignItems="center"
        spacing="xxs"
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder="Milk, cheese, apples etc."
        />
        <Button type="submit" disabled={adding}>
          Add
        </Button>
      </Stack>
    </>
  );
}

export default List;
