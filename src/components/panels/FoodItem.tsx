"use client";

import { useState } from "react";
import { shortDate } from "@/lib/dates";
import type { FoodEntry, Reaction } from "@/lib/types";

const REACTION_ICON: Record<string, string> = {
  liked: "😊",
  neutral: "😐",
  disliked: "😖",
  reaction: "⚠️",
};

type FoodItemProps = {
  food: FoodEntry;
  onUpdate: (
    id: string,
    updates: { food: string; reaction: Reaction; logged_on: string }
  ) => void;
  onDelete: (id: string) => void;
};

export default function FoodItem({ food, onUpdate, onDelete }: FoodItemProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(food.food);
  const [reaction, setReaction] = useState<Reaction>(food.reaction);
  const [loggedOn, setLoggedOn] = useState(food.logged_on);

  function startEdit() {
    setName(food.food);
    setReaction(food.reaction);
    setLoggedOn(food.logged_on);
    setEditing(true);
  }

  function save() {
    if (!name.trim() || !loggedOn) return;
    onUpdate(food.id, { food: name, reaction, logged_on: loggedOn });
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="food-item food-item-editing">
        <div className="food-edit">
          <input
            type="date"
            className="food-edit-date"
            aria-label="Date"
            value={loggedOn}
            onChange={(e) => setLoggedOn(e.target.value)}
          />
          <input
            type="text"
            className="food-edit-name"
            aria-label="Food"
            placeholder="Food name…"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
            }}
          />
          <select
            className="food-edit-reaction"
            aria-label="Reaction"
            value={reaction ?? ""}
            onChange={(e) => setReaction((e.target.value || null) as Reaction)}
          >
            <option value="">No reaction noted</option>
            <option value="liked">😊 Liked it</option>
            <option value="neutral">😐 Neutral</option>
            <option value="disliked">😖 Disliked</option>
            <option value="reaction">⚠️ Possible reaction</option>
          </select>
          <div className="food-edit-actions">
            <button type="button" className="btn-text" onClick={cancel}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="food-item">
      <span className="food-date">{shortDate(food.logged_on)}</span>
      <span
        className="food-name editable-text"
        title="Click to edit"
        onClick={startEdit}
      >
        {food.food}
      </span>
      <span className="food-reaction">
        {food.reaction ? REACTION_ICON[food.reaction] : ""}
      </span>
      <button
        type="button"
        className="del-btn"
        aria-label="Delete entry"
        onClick={() => onDelete(food.id)}
      >
        ✕
      </button>
    </li>
  );
}
