import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/survival-C5WLRIso.js
var joinBrQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input ?? {}).handler(createSsrRpc("afaccb95f4ef89df40bd6e8b7ccc22060948add8b642658f9d16405c0d9dbca2"));
var pollBrQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("62477c4d26065f5f4541e09838d158d4908107c858d6e73f06c4cc0ea2bb773c"));
var leaveBrQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("8442ca29bb8a6b35907ec00eae17e41b8987617026d1d3e87bc7ad490cf25e4d"));
var getBrRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((roomId) => roomId).handler(createSsrRpc("0acf986e81d8b5ad472ed2a3bdd842b95a56638300c1fe870e171747ff047c77"));
var submitBrAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("e54f2db5595267e5d5a36d7993fd0bc9aecbb758ad3c7964d285c048717a69ca"));
var getBrQuestion = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((roomId) => roomId).handler(createSsrRpc("92e4f2877feb1236c4a7d018e70149fb32d15db90b6acce813d61bf971c29b35"));
//#endregion
export { pollBrQueue as a, leaveBrQueue as i, getBrRoom as n, submitBrAnswer as o, joinBrQueue as r, getBrQuestion as t };
