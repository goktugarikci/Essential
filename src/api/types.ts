// src/api/types.ts
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
}

export interface ServerData {
  name: string;
  icon_url?: string;
  is_public: boolean;
}

export interface MessageData {
  content: string;
  channel_id: string;
}

export interface KanbanCardData {
  title: string;
  description?: string;
  list_id: string;
  assigned_to?: string;
  deadline?: string;
}