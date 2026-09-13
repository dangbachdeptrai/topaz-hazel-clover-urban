import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/documents-ctf7KqZn.js
var listMyDocs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e7460d1e3960b9b3028a68f803bf34fec57bf9dad714ab81aa6cb8bbea2fd763"));
var uploadDoc = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("de3efd1e4d205a38ab2e81c1083e89d2131e6ad601135fff3d13206314d239d7"));
var getDoc = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("151af5a0165119b8f4cdc1226420f549eecc8abd87ed641924aabd682e850781"));
var deleteDoc = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("3ff88eda08ef213eed20ac11ecc4c1ddf2848bf3dcbbe89a8bf0545b13e1fd42"));
var extractExamFromDoc = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((docId) => docId).handler(createSsrRpc("5f49162375af8c0cb2702f0f34d44ac9c0d15316701adffe929d0a7aa80c61d5"));
//#endregion
export { uploadDoc as a, listMyDocs as i, extractExamFromDoc as n, getDoc as r, deleteDoc as t };
