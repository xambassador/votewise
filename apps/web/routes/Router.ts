/* eslint-disable no-underscore-dangle */
import type { NextApiRequest, NextApiResponse } from "next";

type ControllerFunction = <T>(req: NextApiRequest, res: NextApiResponse) => Promise<T>;
type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";
type Route = {
  path: string;
  method: Method;
  handler: ControllerFunction;
};

export default class Router {
  private _map!: Map<string, Route[]>;

  constructor() {
    this._initializeMap();
  }

  private _initializeMap() {
    this._map = new Map();

    this._map.set("GET", []);
    this._map.set("POST", []);
    this._map.set("PUT", []);
    this._map.set("DELETE", []);
    this._map.set("PATCH", []);
    this._map.set("OPTIONS", []);
    this._map.set("HEAD", []);
    this._map.set("CONNECT", []);
    this._map.set("TRACE", []);
  }

  public get(path: string, handler: ControllerFunction) {
    this._addRoute("GET", path, handler);
  }

  public post(path: string, handler: ControllerFunction) {
    this._addRoute("POST", path, handler);
  }

  public put(path: string, handler: ControllerFunction) {
    this._addRoute("PUT", path, handler);
  }

  public delete(path: string, handler: ControllerFunction) {
    this._addRoute("DELETE", path, handler);
  }

  public patch(path: string, handler: ControllerFunction) {
    this._addRoute("PATCH", path, handler);
  }

  public options(path: string, handler: ControllerFunction) {
    this._addRoute("OPTIONS", path, handler);
  }

  public head(path: string, handler: ControllerFunction) {
    this._addRoute("HEAD", path, handler);
  }

  public connect(path: string, handler: ControllerFunction) {
    this._addRoute("CONNECT", path, handler);
  }

  public trace(path: string, handler: ControllerFunction) {
    this._addRoute("TRACE", path, handler);
  }

  private _addRoute(method: Method, path: string, handler: ControllerFunction) {
    if (!this._map.has(method)) {
      throw new Error(`Invalid method ${method}`);
    }

    this._map.get(method)?.push({
      path,
      method,
      handler,
    });
  }

  public getRoutes(): Map<string, Route[]> {
    return this._map;
  }

  private _getRoute(method: Method, path: string): Route | undefined {
    const routes = this._map.get(method);
    if (!routes) return undefined;
    return routes.find((route) => {
      const isPathContainsParams = route.path.includes(":");
      if (isPathContainsParams) {
        const routePath = route.path.split("/");
        const urlPath = path.split("/");
        if (routePath.length !== urlPath.length) return false;
        for (let i = 0; i < routePath.length; i += 1) {
          // eslint-disable-next-line no-continue
          if (routePath[i] !== urlPath[i]) continue;
          // eslint-disable-next-line no-continue
          if (routePath[i].startsWith(":")) continue;
          return false;
        }
        return true;
      }
      return route.path === path;
    });
  }

  public async handleRequest(req: NextApiRequest, res: NextApiResponse) {
    const { method, url } = req;
    const route = this._getRoute(method as Method, url as string);
    if (!route) {
      return res.status(404).json({
        message: "Not found",
        success: false,
        error: {
          code: 404,
          message: `Cannot ${method} ${url}`,
        },
        data: null,
      });
    }

    // -- It's handler job to return proper response
    const response = await route.handler(req, res);
    return response;
  }
}
