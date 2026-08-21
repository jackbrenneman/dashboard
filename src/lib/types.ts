// Shared shape for any reorderable checklist (todos, meals).
export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
  position: number;
};
