/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as RegisterImport } from './routes/register'
import { Route as LogoutImport } from './routes/logout'
import { Route as LoginImport } from './routes/login'
import { Route as CreateImport } from './routes/create'
import { Route as IndexImport } from './routes/index'
import { Route as RoomsRoomIdImport } from './routes/rooms/$roomId'
import { Route as ContestsContestIdImport } from './routes/contests/$contestId'

// Create/Update Routes

const RegisterRoute = RegisterImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => rootRoute,
} as any)

const LogoutRoute = LogoutImport.update({
  id: '/logout',
  path: '/logout',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const CreateRoute = CreateImport.update({
  id: '/create',
  path: '/create',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const RoomsRoomIdRoute = RoomsRoomIdImport.update({
  id: '/rooms/$roomId',
  path: '/rooms/$roomId',
  getParentRoute: () => rootRoute,
} as any)

const ContestsContestIdRoute = ContestsContestIdImport.update({
  id: '/contests/$contestId',
  path: '/contests/$contestId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/create': {
      id: '/create'
      path: '/create'
      fullPath: '/create'
      preLoaderRoute: typeof CreateImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/logout': {
      id: '/logout'
      path: '/logout'
      fullPath: '/logout'
      preLoaderRoute: typeof LogoutImport
      parentRoute: typeof rootRoute
    }
    '/register': {
      id: '/register'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof RegisterImport
      parentRoute: typeof rootRoute
    }
    '/contests/$contestId': {
      id: '/contests/$contestId'
      path: '/contests/$contestId'
      fullPath: '/contests/$contestId'
      preLoaderRoute: typeof ContestsContestIdImport
      parentRoute: typeof rootRoute
    }
    '/rooms/$roomId': {
      id: '/rooms/$roomId'
      path: '/rooms/$roomId'
      fullPath: '/rooms/$roomId'
      preLoaderRoute: typeof RoomsRoomIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/create': typeof CreateRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/register': typeof RegisterRoute
  '/contests/$contestId': typeof ContestsContestIdRoute
  '/rooms/$roomId': typeof RoomsRoomIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/create': typeof CreateRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/register': typeof RegisterRoute
  '/contests/$contestId': typeof ContestsContestIdRoute
  '/rooms/$roomId': typeof RoomsRoomIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/create': typeof CreateRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/register': typeof RegisterRoute
  '/contests/$contestId': typeof ContestsContestIdRoute
  '/rooms/$roomId': typeof RoomsRoomIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/create'
    | '/login'
    | '/logout'
    | '/register'
    | '/contests/$contestId'
    | '/rooms/$roomId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/create'
    | '/login'
    | '/logout'
    | '/register'
    | '/contests/$contestId'
    | '/rooms/$roomId'
  id:
    | '__root__'
    | '/'
    | '/create'
    | '/login'
    | '/logout'
    | '/register'
    | '/contests/$contestId'
    | '/rooms/$roomId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  CreateRoute: typeof CreateRoute
  LoginRoute: typeof LoginRoute
  LogoutRoute: typeof LogoutRoute
  RegisterRoute: typeof RegisterRoute
  ContestsContestIdRoute: typeof ContestsContestIdRoute
  RoomsRoomIdRoute: typeof RoomsRoomIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  CreateRoute: CreateRoute,
  LoginRoute: LoginRoute,
  LogoutRoute: LogoutRoute,
  RegisterRoute: RegisterRoute,
  ContestsContestIdRoute: ContestsContestIdRoute,
  RoomsRoomIdRoute: RoomsRoomIdRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/create",
        "/login",
        "/logout",
        "/register",
        "/contests/$contestId",
        "/rooms/$roomId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/create": {
      "filePath": "create.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/logout": {
      "filePath": "logout.tsx"
    },
    "/register": {
      "filePath": "register.tsx"
    },
    "/contests/$contestId": {
      "filePath": "contests/$contestId.tsx"
    },
    "/rooms/$roomId": {
      "filePath": "rooms/$roomId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
