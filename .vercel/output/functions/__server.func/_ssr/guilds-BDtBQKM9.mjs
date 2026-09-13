import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guilds-BDtBQKM9.js
var listGuilds = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("cc4c9cbe00913cf88bdb85851de44327e467ad3429270b8cb5c8282d82e579c6"));
var getGuild = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((guildId) => guildId).handler(createSsrRpc("fd2b438b0fc464670252d22e647ba53ddb84e746c946bf5f9018495839ac399c"));
var createGuild = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("181c930b5959227d185b4c3f8c62cb3869f44260e6d1601b0f83bfdd3ae37c09"));
var joinGuild = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("d3d21f33596c1b4044b6bce71598921ef0aa318e75183569a22799f2d5e12c00"));
var leaveGuild = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("cd1b66a8760fb3681d1c5675f9aabe3f531f943ec5dd9ca33716185748f0962d"));
var kickMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("bc7640cad3429852662e5211d77df18827f64b831469fc71276938e17ed80eff"));
//#endregion
export { leaveGuild as a, kickMember as i, getGuild as n, listGuilds as o, joinGuild as r, createGuild as t };
