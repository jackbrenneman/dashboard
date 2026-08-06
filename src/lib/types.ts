// Shared shape for any reorderable checklist (todos, meals).
export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
  position: number;
};

export type Reaction = "liked" | "neutral" | "disliked" | "reaction" | null;

export type FoodEntry = {
  id: string;
  food: string;
  reaction: Reaction;
  logged_on: string;
};
