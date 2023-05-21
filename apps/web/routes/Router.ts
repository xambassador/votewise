/* eslint-disable no-underscore-dangle */
import type { NextApiRequest, NextApiResponse } from "next";

type ControllerFunction = <T>(req: NextApiRequest, res: NextApiResponse) => Promise<T> | T | void;
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

  private _getRoute(
    method: Method,
    url: string,
    query: Partial<{
      [key: string]: string | string[];
    }>
  ): Route | undefined {
    const routes = this._map.get(method);
    if (!routes) return undefined;

    if (Object.keys(query).length === 0) {
      return routes.find((route) => route.path === url.split("?")[0]);
    }

    let route: Route | undefined;

    for (let i = 0; i < routes.length; i += 1) {
      const currentRoute = routes[i];
      const params = Object.keys(query);
      const currentUrl = url.split("?")[0];

      for (let j = 0; j < params.length; j += 1) {
        const param = params[j];
        const value = query[param];
        const regex = new RegExp(`:${param}`, "g");
        const newPath = currentRoute.path.replace(regex, value as string);

        if (newPath === currentUrl) {
          return currentRoute;
        }
      }
    }

    return route;
  }

  public async handleRequest(req: NextApiRequest, res: NextApiResponse) {
    const { method, url, query } = req;
    const route = this._getRoute(method as Method, url as string, query);
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
