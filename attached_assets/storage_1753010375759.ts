// This is a frontend-only application with localStorage persistence
// Server storage is not used but kept for compatibility

export interface IStorage {
  // Empty interface - all data is handled client-side
}

export class MemStorage implements IStorage {
  constructor() {
    // No-op - all data is handled client-side with localStorage
  }
}
  }
}

export const storage = new MemStorage();
