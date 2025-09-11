export class EntityManager {
  private entities: Map<string, Entity> = new Map();
}

// export abstract class Entity {
//   id: string;

//   constructor() {
//     this.id = crypto.randomUUID();
//   }
// }

export interface Entity {
  id: string;
}
