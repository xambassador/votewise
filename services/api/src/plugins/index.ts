import { JWTPlugin, jwtPluginFactory } from "./jwt";
import { RequestParserPlugin, requestParserPluginFactory } from "./request-parser";

export { JWTPlugin, RequestParserPlugin, jwtPluginFactory, requestParserPluginFactory };

declare global {
  interface Plugins {
    jwt: JWTPlugin;
    requestParser: RequestParserPlugin;
  }
}
