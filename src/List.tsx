import { Button, Checkbox, Input, Stack } from '@devmoods/ui';
import * as React from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { db } from './firebase';
import RemoveIcon from './remove.svg';

interface Item {
  id: string;
  name: string;
  needed: boolean;
  order: string;
}

interface ListProps {
  listId: string;
  editMode: boolean;
}

function List({ listId, editMode }: ListProps) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [adding, setAdding] = React.useState(false);

  const [value, loading, error] = useCollectionData<Item>(
    db.collection(`lists/${listId}/items`).orderBy('order'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
      idField: 'id'
    }
  );

  const handleToggleNeeded = React.useCallback(
    (itemId: string, needed: boolean) => {
      db.collection(`lists/${listId}/items`).doc(itemId).update({
        needed
      });
    },
    [listId]
  );

  const handleAddItem: React.FormEventHandler<HTMLFormElement> = React.useCallback(
    async e => {
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

          const item = listRef.current?.querySelector(
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
    },
    [listId]
  );

  const handleDeleteItem = React.useCallback(
    async (itemId: string) => {
      db.collection(`lists/${listId}/items`).doc(itemId).delete();
    },
    [listId]
  );

  if (error) {
    throw error;
  }

  const docs = value
    ? value.filter(item => {
        if (editMode) {
          return true;
        }

        return !!item.needed;
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
          {docs.map(item => {
            return (
              <ListItem
                key={item.id}
                id={item.id}
                name={item.name}
                order={item.order}
                needed={item.needed}
                isEditing={editMode}
                onToggleChecked={handleToggleNeeded}
                onDelete={handleDeleteItem}
              />
            );
          })}
        </ul>
      )}

      <AddNewItemForm
        ref={inputRef}
        onSubmit={handleAddItem}
        disabled={adding}
      />
    </>
  );
}

interface AddNewItemFormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  disabled?: boolean;
}

const AddNewItemForm = React.forwardRef<HTMLInputElement, AddNewItemFormProps>(
  function AddNewItemForm({ onSubmit, disabled }, ref) {
    const [hasFocus, setFocus] = React.useState(false);
    return (
      <Stack
        as="form"
        onSubmit={onSubmit}
        noValidate
        horizontal
        alignItems="center"
        spacing="xxs"
        className="add-new-item-form"
        data-focused={hasFocus}
      >
        <Input
          ref={ref}
          type="text"
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder="We need..."
        />
        <Button type="submit" disabled={disabled}>
          Add
        </Button>
      </Stack>
    );
  }
);

interface ListItemProps {
  id: string;
  name: string;
  order: string;
  isEditing: boolean;
  needed: boolean;
  onToggleChecked: (itemId: string, checked: boolean) => void;
  onDelete: (itemId: string) => void;
}

const ListItem = React.memo(function ListItem({
  id,
  name,
  isEditing,
  order,
  needed,
  onToggleChecked,
  onDelete
}: ListItemProps) {
  return (
    <li data-name={order}>
      <div className="item-name">
        <Checkbox
          style={{
            ['--Checkbox-color' as any]: '#eee',
            ['--Checkbox-checkColor' as any]: '#777'
          }}
          onChange={e => onToggleChecked(id, !e.currentTarget.checked)}
          checked={!needed}
        >
          <span
            style={{
              fontWeight: needed ? 600 : 400,
              textDecoration: needed ? 'none' : 'line-through',
              marginTop: -2,
              display: 'block'
            }}
          >
            {name}
          </span>
        </Checkbox>
      </div>

      {isEditing && (
        <Button
          intent="danger"
          variant="text"
          className="Button--delete"
          onClick={() => onDelete(id)}
        >
          {/* @ts-ignore */}
          <RemoveIcon style={{ width: 24, height: 24 }} />
        </Button>
      )}
    </li>
  );
});

export default List;
