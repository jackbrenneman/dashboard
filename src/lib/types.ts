// Shared shape for any reorderable checklist (todos, meals, school_todos).
export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
  position: number;
};

// School due date — always displayed sorted by `date`, not `position`.
export type DueDate = {
  id: string;
  text: string;
  date: string;
  position: number;
};

// School important link — reorderable via `position`.
export type ImportantLink = {
  id: string;
  text: string;
  url: string;
  position: number;
};
