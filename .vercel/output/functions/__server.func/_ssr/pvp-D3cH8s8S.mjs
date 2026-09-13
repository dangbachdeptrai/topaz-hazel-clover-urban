import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pvp-D3cH8s8S.js
var joinPvpQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("3447315fcb0561f5949dc1b6617871322cce497994d9c4ee5a15e55170676235"));
var pollPvpQueue = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("c3b4715ba59dd0ea8eaf2913c04e48c4c9cd078cd69dbf8ff940d2d5fc92776f"));
var leavePvpQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("4972ba2fa8f32af96c4fa914ff3f7e9023a3cdae09438fcd52c2ab3035c22a3c"));
var createPvpRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("c16d3360fb78fa51e64da7a38b4e54f005c9ead506b9030cf6553011be5e374a"));
var joinPvpRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("4b734c84b1322c916eb76c56c1f534a5c371bb8841be59c2a76cad2503d41c02"));
var getPvpMatch = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((matchId) => matchId).handler(createSsrRpc("5dd9007afbd90ee25de6435fd6528d811f2f96a25a95f5cf54db97be76f21d11"));
var submitPvpAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("5e5e3553335910bec12bb703591eead87bad51c000fd2c00088f75bcad2b364f"));
var finishPvp = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((matchId) => matchId).handler(createSsrRpc("4bb608b2389af70630d50891406905cd7fdec0bb6ded1739d67d2bab16a3efcf"));
var listMyPvp = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0b36f8f3bdb5c416ce480a5175f98e2108af895124bc07a298cd173626e6b5d8"));
//#endregion
export { joinPvpRoom as a, pollPvpQueue as c, joinPvpQueue as i, submitPvpAnswer as l, finishPvp as n, leavePvpQueue as o, getPvpMatch as r, listMyPvp as s, createPvpRoom as t };
