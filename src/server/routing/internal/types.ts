import type { ConcreteRouter, Middleware, Router } from './dependencies';

export type RouterGetter = (...middleware: Middleware[]) => Router;
export interface RoutingStrategy {
  applyRoutes(router: ConcreteRouter): void;
}
