"use client";

import { useState } from "react";
import { useFoods } from "@/hooks/useFoods";
import FoodItem from "@/components/panels/FoodItem";
import type { Reaction } from "@/lib/types";

export default function FoodLog() {
  const { foods, loading, addFood, updateFood, deleteFood } = useFoods();
  const [name, setName] = useState("");
  const [reaction, setReaction] = useState<Reaction>(null);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return;
    addFood(name, reaction);
    setName("");
    setReaction(null);
  }

  return (
    <div className="solids-tracker">
      <h3>Foods we&apos;ve tried</h3>
      <form onSubmit={submit}>
        <div className="add-row">
          <input
            type="text"
            placeholder="Food name…"
            aria-label="Food tried"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="primary">
            Log
          </button>
        </div>
        <div className="add-row" style={{ marginTop: "-4px" }}>
          <select
            aria-label="Reaction"
            value={reaction ?? ""}
            onChange={(e) =>
              setReaction((e.target.value || null) as Reaction)
            }
            style={{
              flex: 1,
              padding: "8px 10px",
              border: "1px solid var(--border-strong)",
              borderRadius: "6px",
              fontSize: "13.5px",
              background: "#fff",
              color: "var(--text)",
            }}
          >
            <option value="">No reaction noted</option>
            <option value="liked">😊 Liked it</option>
            <option value="neutral">😐 Neutral</option>
            <option value="disliked">😖 Disliked</option>
            <option value="reaction">⚠️ Possible reaction</option>
          </select>
        </div>
      </form>

      {!loading && foods.length === 0 ? (
        <p className="empty-state">
          Nothing logged yet — add the first food above.
        </p>
      ) : (
        <ul className="food-list">
          {foods.map((f) => (
            <FoodItem
              key={f.id}
              food={f}
              onUpdate={updateFood}
              onDelete={deleteFood}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
