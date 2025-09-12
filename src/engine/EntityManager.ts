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

  public add(t: T) {
    t.id ||= crypto.randomUUID();
    this.entities.set(t.id, t);
  }

  public abstract spawn(): T;

  public abstract update(): void;
}

abstract class EntityMap<T extends Entity> extends Map<string, T> {
  public abstract update(): void;
}
