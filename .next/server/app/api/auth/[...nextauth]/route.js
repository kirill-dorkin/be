/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("mongoose");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fmorfi%2Ftest3000%2Fbe%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmorfi%2Ftest3000%2Fbe&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fmorfi%2Ftest3000%2Fbe%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmorfi%2Ftest3000%2Fbe&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_morfi_test3000_be_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/Users/morfi/test3000/be/src/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_morfi_test3000_be_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm1vcmZpJTJGdGVzdDMwMDAlMkZiZSUyRnNyYyUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZtb3JmaSUyRnRlc3QzMDAwJTJGYmUmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ2dCO0FBQzdGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsid2VicGFjazovLy8/NGY1YiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL21vcmZpL3Rlc3QzMDAwL2JlL3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvbW9yZmkvdGVzdDMwMDAvYmUvc3JjL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fmorfi%2Ftest3000%2Fbe%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmorfi%2Ftest3000%2Fbe&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./src/app/api/auth/[...nextauth]/route.ts":
/*!*************************************************!*\
  !*** ./src/app/api/auth/[...nextauth]/route.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var _auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/auth */ \"(rsc)/./src/auth.ts\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_1___default()(_auth__WEBPACK_IMPORTED_MODULE_0__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBb0M7QUFDSjtBQUVoQyxNQUFNRSxVQUFVRCxnREFBUUEsQ0FBQ0QsOENBQVdBO0FBRU0iLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHM/MDA5OCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gXCJAL2F1dGhcIlxuaW1wb3J0IE5leHRBdXRoIGZyb20gXCJuZXh0LWF1dGhcIlxuXG5jb25zdCBoYW5kbGVyID0gTmV4dEF1dGgoYXV0aE9wdGlvbnMpXG5cbmV4cG9ydCB7IGhhbmRsZXIgYXMgR0VULCBoYW5kbGVyIGFzIFBPU1QgfVxuIl0sIm5hbWVzIjpbImF1dGhPcHRpb25zIiwiTmV4dEF1dGgiLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/auth.ts":
/*!*********************!*\
  !*** ./src/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions),\n/* harmony export */   getSession: () => (/* binding */ getSession)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _lib_dbUtils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/dbUtils */ \"(rsc)/./src/lib/dbUtils.ts\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _lib_dbConnect__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/dbConnect */ \"(rsc)/./src/lib/dbConnect.ts\");\n\n\n\n\n\nconst authOptions = {\n    secret: process.env.NEXTAUTH_SECRET,\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    jwt: {\n        maxAge: 30 * 24 * 60 * 60\n    },\n    cookies: {\n        sessionToken: {\n            name: `next-auth.session-token`,\n            options: {\n                httpOnly: true,\n                sameSite: 'lax',\n                path: '/',\n                secure: \"development\" === 'production'\n            }\n        }\n    },\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"Credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"text\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials) return null;\n                try {\n                    await (0,_lib_dbConnect__WEBPACK_IMPORTED_MODULE_4__.connectToDatabase)();\n                    const user = await (0,_lib_dbUtils__WEBPACK_IMPORTED_MODULE_2__.getUserByEmail)(credentials.email);\n                    if (!user || !user.passwordHash) {\n                        return null;\n                    }\n                    const isValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_3___default().compare(credentials.password, user.passwordHash);\n                    if (!isValid) {\n                        return null;\n                    }\n                    return {\n                        id: user._id.toString(),\n                        email: user.email,\n                        name: user.name,\n                        image: user.image,\n                        role: user.role\n                    };\n                } catch (error) {\n                    console.error(\"Error during credentials authorize\", error);\n                    return null;\n                }\n            }\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            try {\n                if (user) {\n                    token.role = user.role;\n                    token.image = user.image;\n                    token.name = user.name;\n                    token.email = user.email;\n                    token.id = user.id;\n                }\n                return token;\n            } catch (error) {\n                console.error(\"JWT callback error:\", error);\n                // Return the original token if there's an error\n                return token;\n            }\n        },\n        async session ({ session, token }) {\n            try {\n                if (token && token.email) {\n                    session.user.role = token.role;\n                    session.user.email = token.email;\n                    session.user.image = token.image;\n                    session.user.name = token.name;\n                    session.user.id = token.id;\n                }\n                return session;\n            } catch (error) {\n                console.error(\"Session callback error:\", error);\n                return session;\n            }\n        }\n    },\n    pages: {\n        signIn: '/login',\n        error: '/login'\n    },\n    events: {\n        async signOut () {\n        // Clear any cached session data\n        }\n    },\n    debug: \"development\" === 'development'\n};\nconst getSession = async ()=>{\n    try {\n        return await (0,next_auth__WEBPACK_IMPORTED_MODULE_0__.getServerSession)(authOptions);\n    } catch (error) {\n        console.error(\"Session retrieval failed:\", error);\n        return null;\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q1QsRUFBRSxPQUFPNEIsT0FBTztnQkFDZEMsUUFBUUQsS0FBSyxDQUFDLDJCQUEyQkE7Z0JBQ3pDLE9BQU81QjtZQUNUO1FBQ0Y7SUFDRjtJQUNBZ0MsT0FBTztRQUNMQyxRQUFRO1FBQ1JMLE9BQU87SUFDVDtJQUNBTSxRQUFRO1FBQ04sTUFBTUM7UUFDSixnQ0FBZ0M7UUFDbEM7SUFDRjtJQUNBQyxPQUFPdkMsa0JBQXlCO0FBQ2xDLEVBQUU7QUFFSyxNQUFNd0MsYUFBYTtJQUN4QixJQUFJO1FBQ0YsT0FBTyxNQUFNL0MsMkRBQWdCQSxDQUFDSztJQUNoQyxFQUFFLE9BQU9pQyxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyw2QkFBNkJBO1FBQzNDLE9BQU87SUFDVDtBQUNGLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvYXV0aC50cz82MmQ5Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRBdXRoT3B0aW9ucywgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gXCJuZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzXCI7XG5pbXBvcnQgeyBnZXRVc2VyQnlFbWFpbCB9IGZyb20gXCIuL2xpYi9kYlV0aWxzXCI7XG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xuaW1wb3J0IHsgY29ubmVjdFRvRGF0YWJhc2UgfSBmcm9tIFwiQC9saWIvZGJDb25uZWN0XCI7XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xuICBzZWNyZXQ6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVCxcbiAgc2Vzc2lvbjoge1xuICAgIHN0cmF0ZWd5OiBcImp3dFwiLFxuICAgIG1heEFnZTogMzAgKiAyNCAqIDYwICogNjAsIC8vIDMwIGRheXNcbiAgfSxcbiAgand0OiB7XG4gICAgbWF4QWdlOiAzMCAqIDI0ICogNjAgKiA2MCwgLy8gMzAgZGF5c1xuICB9LFxuICBjb29raWVzOiB7XG4gICAgc2Vzc2lvblRva2VuOiB7XG4gICAgICBuYW1lOiBgbmV4dC1hdXRoLnNlc3Npb24tdG9rZW5gLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBodHRwT25seTogdHJ1ZSxcbiAgICAgICAgc2FtZVNpdGU6ICdsYXgnLFxuICAgICAgICBwYXRoOiAnLycsXG4gICAgICAgIHNlY3VyZTogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICBuYW1lOiBcIkNyZWRlbnRpYWxzXCIsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcInRleHRcIiB9LFxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJQYXNzd29yZFwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfSxcbiAgICAgIH0sXG4gICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgaWYgKCFjcmVkZW50aWFscykgcmV0dXJuIG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgY29ubmVjdFRvRGF0YWJhc2UoKTtcbiAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlckJ5RW1haWwoY3JlZGVudGlhbHMuZW1haWwpO1xuICAgICAgICAgIGlmICghdXNlciB8fCAhdXNlci5wYXNzd29yZEhhc2gpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoY3JlZGVudGlhbHMucGFzc3dvcmQsIHVzZXIucGFzc3dvcmRIYXNoKTtcbiAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpZDogdXNlci5faWQudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgICAgICAgIG5hbWU6IHVzZXIubmFtZSxcbiAgICAgICAgICAgICAgaW1hZ2U6IHVzZXIuaW1hZ2UsXG4gICAgICAgICAgICAgIHJvbGU6IHVzZXIucm9sZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGR1cmluZyBjcmVkZW50aWFscyBhdXRob3JpemVcIiwgZXJyb3IpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgIHRva2VuLnJvbGUgPSB1c2VyLnJvbGU7XG4gICAgICAgICAgdG9rZW4uaW1hZ2UgPSB1c2VyLmltYWdlO1xuICAgICAgICAgIHRva2VuLm5hbWUgPSB1c2VyLm5hbWU7XG4gICAgICAgICAgdG9rZW4uZW1haWwgPSB1c2VyLmVtYWlsO1xuICAgICAgICAgIHRva2VuLmlkID0gdXNlci5pZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiSldUIGNhbGxiYWNrIGVycm9yOlwiLCBlcnJvcik7XG4gICAgICAgIC8vIFJldHVybiB0aGUgb3JpZ2luYWwgdG9rZW4gaWYgdGhlcmUncyBhbiBlcnJvclxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAodG9rZW4gJiYgdG9rZW4uZW1haWwpIHtcbiAgICAgICAgICBzZXNzaW9uLnVzZXIucm9sZSA9IHRva2VuLnJvbGUgYXMgc3RyaW5nO1xuICAgICAgICAgIHNlc3Npb24udXNlci5lbWFpbCA9IHRva2VuLmVtYWlsIGFzIHN0cmluZztcbiAgICAgICAgICBzZXNzaW9uLnVzZXIuaW1hZ2UgPSB0b2tlbi5pbWFnZSBhcyBzdHJpbmc7XG4gICAgICAgICAgc2Vzc2lvbi51c2VyLm5hbWUgPSB0b2tlbi5uYW1lIGFzIHN0cmluZztcbiAgICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZCBhcyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiU2Vzc2lvbiBjYWxsYmFjayBlcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogJy9sb2dpbicsXG4gICAgZXJyb3I6ICcvbG9naW4nLFxuICB9LFxuICBldmVudHM6IHtcbiAgICBhc3luYyBzaWduT3V0KCkge1xuICAgICAgLy8gQ2xlYXIgYW55IGNhY2hlZCBzZXNzaW9uIGRhdGFcbiAgICB9LFxuICB9LFxuICBkZWJ1ZzogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcsXG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U2Vzc2lvbiA9IGFzeW5jICgpID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIlNlc3Npb24gcmV0cmlldmFsIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuIl0sIm5hbWVzIjpbImdldFNlcnZlclNlc3Npb24iLCJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiZ2V0VXNlckJ5RW1haWwiLCJiY3J5cHQiLCJjb25uZWN0VG9EYXRhYmFzZSIsImF1dGhPcHRpb25zIiwic2VjcmV0IiwicHJvY2VzcyIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCIsInNlc3Npb24iLCJzdHJhdGVneSIsIm1heEFnZSIsImp3dCIsImNvb2tpZXMiLCJzZXNzaW9uVG9rZW4iLCJuYW1lIiwib3B0aW9ucyIsImh0dHBPbmx5Iiwic2FtZVNpdGUiLCJwYXRoIiwic2VjdXJlIiwicHJvdmlkZXJzIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwidXNlciIsInBhc3N3b3JkSGFzaCIsImlzVmFsaWQiLCJjb21wYXJlIiwiaWQiLCJfaWQiLCJ0b1N0cmluZyIsImltYWdlIiwicm9sZSIsImVycm9yIiwiY29uc29sZSIsImNhbGxiYWNrcyIsInRva2VuIiwicGFnZXMiLCJzaWduSW4iLCJldmVudHMiLCJzaWduT3V0IiwiZGVidWciLCJnZXRTZXNzaW9uIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/dbConnect.ts":
/*!******************************!*\
  !*** ./src/lib/dbConnect.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   connectToDatabase: () => (/* binding */ connectToDatabase)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst DB_URL = process.env.DB_URL || \"mongodb://localhost:27017/test\";\nlet cached = global.mongoose;\nif (!cached) {\n    cached = global.mongoose = {\n        conn: null,\n        promise: null\n    };\n}\nasync function connectToDatabase() {\n    if (cached?.conn) {\n        return cached.conn;\n    }\n    if (!cached?.promise) {\n        const options = {};\n        cached.promise = mongoose__WEBPACK_IMPORTED_MODULE_0___default().connect(DB_URL, options).then((mongooseInstance)=>{\n            console.log(\"Connected to MongoDB\");\n            return mongooseInstance;\n        });\n    }\n    cached.conn = await cached.promise;\n    return cached.conn;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2RiQ29ubmVjdC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBb0Q7QUFFcEQsTUFBTUMsU0FBU0MsUUFBUUMsR0FBRyxDQUFDRixNQUFNLElBQUk7QUFZckMsSUFBSUcsU0FBU0MsT0FBT0wsUUFBUTtBQUU1QixJQUFJLENBQUNJLFFBQVE7SUFDWEEsU0FBU0MsT0FBT0wsUUFBUSxHQUFHO1FBQUVNLE1BQU07UUFBTUMsU0FBUztJQUFLO0FBQ3pEO0FBRU8sZUFBZUM7SUFDcEIsSUFBSUosUUFBUUUsTUFBTTtRQUNoQixPQUFPRixPQUFPRSxJQUFJO0lBQ3BCO0lBRUEsSUFBSSxDQUFDRixRQUFRRyxTQUFTO1FBQ3BCLE1BQU1FLFVBQTBCLENBQUM7UUFDakNMLE9BQVFHLE9BQU8sR0FBR1AsdURBQWdCLENBQUNDLFFBQVFRLFNBQVNFLElBQUksQ0FBQyxDQUFDQztZQUN4REMsUUFBUUMsR0FBRyxDQUFDO1lBQ1osT0FBT0Y7UUFDVDtJQUNGO0lBRUFSLE9BQVFFLElBQUksR0FBRyxNQUFNRixPQUFRRyxPQUFPO0lBQ3BDLE9BQU9ILE9BQVFFLElBQUk7QUFDckIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvbGliL2RiQ29ubmVjdC50cz82MGE3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSwgeyBDb25uZWN0T3B0aW9ucyB9IGZyb20gXCJtb25nb29zZVwiO1xuXG5jb25zdCBEQl9VUkwgPSBwcm9jZXNzLmVudi5EQl9VUkwgfHwgXCJtb25nb2RiOi8vbG9jYWxob3N0OjI3MDE3L3Rlc3RcIjtcblxuaW50ZXJmYWNlIE1vbmdvb3NlQ2FjaGUge1xuICBjb25uOiB0eXBlb2YgbW9uZ29vc2UgfCBudWxsO1xuICBwcm9taXNlOiBQcm9taXNlPHR5cGVvZiBtb25nb29zZT4gfCBudWxsO1xufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby12YXJcbiAgdmFyIG1vbmdvb3NlOiBNb25nb29zZUNhY2hlIHwgdW5kZWZpbmVkO1xufVxuXG5sZXQgY2FjaGVkID0gZ2xvYmFsLm1vbmdvb3NlO1xuXG5pZiAoIWNhY2hlZCkge1xuICBjYWNoZWQgPSBnbG9iYWwubW9uZ29vc2UgPSB7IGNvbm46IG51bGwsIHByb21pc2U6IG51bGwgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbm5lY3RUb0RhdGFiYXNlKCkge1xuICBpZiAoY2FjaGVkPy5jb25uKSB7XG4gICAgcmV0dXJuIGNhY2hlZC5jb25uO1xuICB9XG5cbiAgaWYgKCFjYWNoZWQ/LnByb21pc2UpIHtcbiAgICBjb25zdCBvcHRpb25zOiBDb25uZWN0T3B0aW9ucyA9IHt9O1xuICAgIGNhY2hlZCEucHJvbWlzZSA9IG1vbmdvb3NlLmNvbm5lY3QoREJfVVJMLCBvcHRpb25zKS50aGVuKChtb25nb29zZUluc3RhbmNlKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZCB0byBNb25nb0RCXCIpO1xuICAgICAgcmV0dXJuIG1vbmdvb3NlSW5zdGFuY2U7XG4gICAgfSk7XG4gIH1cblxuICBjYWNoZWQhLmNvbm4gPSBhd2FpdCBjYWNoZWQhLnByb21pc2UhO1xuICByZXR1cm4gY2FjaGVkIS5jb25uO1xufVxuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwiREJfVVJMIiwicHJvY2VzcyIsImVudiIsImNhY2hlZCIsImdsb2JhbCIsImNvbm4iLCJwcm9taXNlIiwiY29ubmVjdFRvRGF0YWJhc2UiLCJvcHRpb25zIiwiY29ubmVjdCIsInRoZW4iLCJtb25nb29zZUluc3RhbmNlIiwiY29uc29sZSIsImxvZyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/dbConnect.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/dbUtils.ts":
/*!****************************!*\
  !*** ./src/lib/dbUtils.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getUserByEmail: () => (/* binding */ getUserByEmail),\n/* harmony export */   saveUser: () => (/* binding */ saveUser)\n/* harmony export */ });\n/* harmony import */ var _dbConnect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dbConnect */ \"(rsc)/./src/lib/dbConnect.ts\");\n/* harmony import */ var _models_User__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../models/User */ \"(rsc)/./src/models/User.ts\");\n\n\nconst getUserByEmail = async (email)=>{\n    try {\n        await (0,_dbConnect__WEBPACK_IMPORTED_MODULE_0__.connectToDatabase)();\n        const user = await _models_User__WEBPACK_IMPORTED_MODULE_1__[\"default\"].findOne({\n            email\n        });\n        return user;\n    } catch (error) {\n        console.error(\"Error getting user by email:\", error);\n        throw new Error(\"Unable to fetch user.\");\n    }\n};\nconst saveUser = async (userData)=>{\n    try {\n        await (0,_dbConnect__WEBPACK_IMPORTED_MODULE_0__.connectToDatabase)();\n        const updateData = {\n            role: userData.role\n        };\n        if (userData.name) {\n            updateData.name = userData.name;\n        }\n        if (userData.image) {\n            updateData.image = userData.image;\n        }\n        const updatedUser = await _models_User__WEBPACK_IMPORTED_MODULE_1__[\"default\"].findOneAndUpdate({\n            email: userData.email\n        }, updateData, {\n            upsert: true,\n            new: true\n        });\n        return updatedUser;\n    } catch (error) {\n        console.error(\"Error creating/updating user:\", error);\n        throw new Error(\"Unable to create or update user.\");\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2RiVXRpbHMudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFnRDtBQUNkO0FBRTNCLE1BQU1FLGlCQUFpQixPQUFPQztJQUNuQyxJQUFJO1FBQ0YsTUFBTUgsNkRBQWlCQTtRQUN2QixNQUFNSSxPQUFPLE1BQU1ILG9EQUFJQSxDQUFDSSxPQUFPLENBQUM7WUFBRUY7UUFBTTtRQUN4QyxPQUFPQztJQUNULEVBQUUsT0FBT0UsT0FBTztRQUNkQyxRQUFRRCxLQUFLLENBQUMsZ0NBQWdDQTtRQUM5QyxNQUFNLElBQUlFLE1BQU07SUFDbEI7QUFDRixFQUFFO0FBRUssTUFBTUMsV0FBVyxPQUFPQztJQU03QixJQUFJO1FBQ0YsTUFBTVYsNkRBQWlCQTtRQUV2QixNQUFNVyxhQUE4RDtZQUNsRUMsTUFBTUYsU0FBU0UsSUFBSTtRQUNyQjtRQUVBLElBQUlGLFNBQVNHLElBQUksRUFBRTtZQUNqQkYsV0FBV0UsSUFBSSxHQUFHSCxTQUFTRyxJQUFJO1FBQ2pDO1FBQ0EsSUFBSUgsU0FBU0ksS0FBSyxFQUFFO1lBQ2xCSCxXQUFXRyxLQUFLLEdBQUdKLFNBQVNJLEtBQUs7UUFDbkM7UUFFQSxNQUFNQyxjQUFjLE1BQU1kLG9EQUFJQSxDQUFDZSxnQkFBZ0IsQ0FDN0M7WUFBRWIsT0FBT08sU0FBU1AsS0FBSztRQUFDLEdBQ3hCUSxZQUNBO1lBQUVNLFFBQVE7WUFBTUMsS0FBSztRQUFLO1FBRzVCLE9BQU9IO0lBQ1QsRUFBRSxPQUFPVCxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyxpQ0FBaUNBO1FBQy9DLE1BQU0sSUFBSUUsTUFBTTtJQUNsQjtBQUNGLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvbGliL2RiVXRpbHMudHM/OTI4NyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb25uZWN0VG9EYXRhYmFzZSB9IGZyb20gJy4vZGJDb25uZWN0JztcbmltcG9ydCBVc2VyIGZyb20gJy4uL21vZGVscy9Vc2VyJztcblxuZXhwb3J0IGNvbnN0IGdldFVzZXJCeUVtYWlsID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcpID0+IHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBjb25uZWN0VG9EYXRhYmFzZSgpO1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmUoeyBlbWFpbCB9KTtcbiAgICByZXR1cm4gdXNlcjtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZ2V0dGluZyB1c2VyIGJ5IGVtYWlsOlwiLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGZldGNoIHVzZXIuXCIpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc2F2ZVVzZXIgPSBhc3luYyAodXNlckRhdGE6IHtcbiAgZW1haWw6IHN0cmluZztcbiAgcm9sZTogc3RyaW5nO1xuICBuYW1lPzogc3RyaW5nO1xuICBpbWFnZT86IHN0cmluZztcbn0pID0+IHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBjb25uZWN0VG9EYXRhYmFzZSgpO1xuXG4gICAgY29uc3QgdXBkYXRlRGF0YTogeyByb2xlOiBzdHJpbmc7IG5hbWU/OiBzdHJpbmc7IGltYWdlPzogc3RyaW5nIH0gPSB7XG4gICAgICByb2xlOiB1c2VyRGF0YS5yb2xlLFxuICAgIH07XG5cbiAgICBpZiAodXNlckRhdGEubmFtZSkge1xuICAgICAgdXBkYXRlRGF0YS5uYW1lID0gdXNlckRhdGEubmFtZTtcbiAgICB9XG4gICAgaWYgKHVzZXJEYXRhLmltYWdlKSB7XG4gICAgICB1cGRhdGVEYXRhLmltYWdlID0gdXNlckRhdGEuaW1hZ2U7XG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlZFVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmVBbmRVcGRhdGUoXG4gICAgICB7IGVtYWlsOiB1c2VyRGF0YS5lbWFpbCB9LFxuICAgICAgdXBkYXRlRGF0YSxcbiAgICAgIHsgdXBzZXJ0OiB0cnVlLCBuZXc6IHRydWUgfVxuICAgICk7XG5cbiAgICByZXR1cm4gdXBkYXRlZFVzZXI7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGNyZWF0aW5nL3VwZGF0aW5nIHVzZXI6XCIsIGVycm9yKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gY3JlYXRlIG9yIHVwZGF0ZSB1c2VyLlwiKTtcbiAgfVxufTtcbiJdLCJuYW1lcyI6WyJjb25uZWN0VG9EYXRhYmFzZSIsIlVzZXIiLCJnZXRVc2VyQnlFbWFpbCIsImVtYWlsIiwidXNlciIsImZpbmRPbmUiLCJlcnJvciIsImNvbnNvbGUiLCJFcnJvciIsInNhdmVVc2VyIiwidXNlckRhdGEiLCJ1cGRhdGVEYXRhIiwicm9sZSIsIm5hbWUiLCJpbWFnZSIsInVwZGF0ZWRVc2VyIiwiZmluZE9uZUFuZFVwZGF0ZSIsInVwc2VydCIsIm5ldyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/dbUtils.ts\n");

/***/ }),

/***/ "(rsc)/./src/models/User.ts":
/*!****************************!*\
  !*** ./src/models/User.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst UserSchema = new mongoose__WEBPACK_IMPORTED_MODULE_0__.Schema({\n    name: {\n        type: String,\n        required: true\n    },\n    email: {\n        type: String,\n        required: true,\n        unique: true\n    },\n    role: {\n        type: String,\n        enum: [\n            'admin',\n            'user',\n            'worker'\n        ],\n        required: true\n    },\n    image: {\n        type: String,\n        required: true\n    },\n    passwordHash: {\n        type: String,\n        required: false\n    },\n    tasks: [\n        {\n            type: (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Types).ObjectId,\n            ref: 'Task',\n            default: undefined\n        }\n    ]\n}, {\n    timestamps: true\n});\nconst User = (mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).User || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model('User', UserSchema);\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (User);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbW9kZWxzL1VzZXIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQXNEO0FBV3RELE1BQU1FLGFBQWEsSUFBSUQsNENBQU1BLENBQzNCO0lBQ0VFLE1BQU07UUFBRUMsTUFBTUM7UUFBUUMsVUFBVTtJQUFLO0lBQ3JDQyxPQUFPO1FBQUVILE1BQU1DO1FBQVFDLFVBQVU7UUFBTUUsUUFBUTtJQUFLO0lBQ3BEQyxNQUFNO1FBQUVMLE1BQU1DO1FBQVFLLE1BQU07WUFBQztZQUFTO1lBQVE7U0FBUztRQUFFSixVQUFVO0lBQUs7SUFDeEVLLE9BQU87UUFBRVAsTUFBTUM7UUFBUUMsVUFBVTtJQUFLO0lBQ3RDTSxjQUFjO1FBQUVSLE1BQU1DO1FBQVFDLFVBQVU7SUFBTTtJQUM5Q08sT0FBTztRQUFDO1lBQUVULE1BQU1KLHVEQUFjLENBQUNlLFFBQVE7WUFBRUMsS0FBSztZQUFRQyxTQUFTQztRQUFVO0tBQUU7QUFDN0UsR0FDQTtJQUNFQyxZQUFZO0FBQ2Q7QUFHRixNQUFNQyxPQUFPcEIsd0RBQWUsQ0FBQ29CLElBQUksSUFBSXBCLHFEQUFjLENBQVEsUUFBUUU7QUFFbkUsaUVBQWVrQixJQUFJQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL21vZGVscy9Vc2VyLnRzPzA5NmQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vbmdvb3NlLCB7IFNjaGVtYSwgRG9jdW1lbnQgfSBmcm9tICdtb25nb29zZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVVzZXIgZXh0ZW5kcyBEb2N1bWVudCB7XG4gIG5hbWU6IHN0cmluZztcbiAgZW1haWw6IHN0cmluZztcbiAgcm9sZTogJ2FkbWluJyB8ICd3b3JrZXInIHwgJ3VzZXInO1xuICBpbWFnZTogc3RyaW5nO1xuICBwYXNzd29yZEhhc2g/OiBzdHJpbmc7XG4gIHRhc2tzPzogbW9uZ29vc2UuVHlwZXMuT2JqZWN0SWRbXTtcbn1cblxuY29uc3QgVXNlclNjaGVtYSA9IG5ldyBTY2hlbWE8SVVzZXI+KFxuICB7XG4gICAgbmFtZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgZW1haWw6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSwgdW5pcXVlOiB0cnVlIH0sXG4gICAgcm9sZTogeyB0eXBlOiBTdHJpbmcsIGVudW06IFsnYWRtaW4nLCAndXNlcicsICd3b3JrZXInXSwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICBpbWFnZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgcGFzc3dvcmRIYXNoOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IGZhbHNlIH0sXG4gICAgdGFza3M6IFt7IHR5cGU6IG1vbmdvb3NlLlR5cGVzLk9iamVjdElkLCByZWY6ICdUYXNrJywgZGVmYXVsdDogdW5kZWZpbmVkIH1dLFxuICB9LFxuICB7XG4gICAgdGltZXN0YW1wczogdHJ1ZSxcbiAgfVxuKTtcblxuY29uc3QgVXNlciA9IG1vbmdvb3NlLm1vZGVscy5Vc2VyIHx8IG1vbmdvb3NlLm1vZGVsPElVc2VyPignVXNlcicsIFVzZXJTY2hlbWEpO1xuXG5leHBvcnQgZGVmYXVsdCBVc2VyO1xuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwiU2NoZW1hIiwiVXNlclNjaGVtYSIsIm5hbWUiLCJ0eXBlIiwiU3RyaW5nIiwicmVxdWlyZWQiLCJlbWFpbCIsInVuaXF1ZSIsInJvbGUiLCJlbnVtIiwiaW1hZ2UiLCJwYXNzd29yZEhhc2giLCJ0YXNrcyIsIlR5cGVzIiwiT2JqZWN0SWQiLCJyZWYiLCJkZWZhdWx0IiwidW5kZWZpbmVkIiwidGltZXN0YW1wcyIsIlVzZXIiLCJtb2RlbHMiLCJtb2RlbCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/models/User.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/@babel","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fmorfi%2Ftest3000%2Fbe%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmorfi%2Ftest3000%2Fbe&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();