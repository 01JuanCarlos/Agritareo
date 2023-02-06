class ComponentFactory {
  factory: Map<string, unknown> = new Map();

  hasComponent(id: string) {
    return this.factory.has(id);
  }

  getComponent(id: string) {
    return this.factory.get(id);
  }

  delComponent(id: string) {

  }

  addComponent(id: string, component: unknown) {
    this.factory.set(id, component);
  }
}

export const MapFactory = new ComponentFactory();
