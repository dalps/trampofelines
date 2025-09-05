export interface Entity {
  id: string;
}

class EntityManager {
  private _entities: Map<string, Entity> = new Map();
}
