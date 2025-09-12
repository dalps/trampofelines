interface Entity {
  id: string;
}

export abstract class EntityManager<T extends Entity> {
  protected entities = new Map<string, T>();

  public get list() {
    return [...this.entities.values()];
  }

  public get count() {
    return this.entities.size;
  }

  public clearEntities() {
    this.entities.clear();
  }

  public delete(t: T) {
    this.entities.delete(t.id);
  }

  protected add(t: T) {
    t.id ||= crypto.randomUUID();
    this.entities.set(t.id, t);
  }

  /** Dispenses a new entity */
  public abstract spawn(...args: any): T;

  public abstract update(): void;
}

abstract class EntityMap<T extends Entity> extends Map<string, T> {
  public abstract update(): void;
}
