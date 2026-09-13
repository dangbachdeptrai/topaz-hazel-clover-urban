import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-Duf1LXkp.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/exams-Dp0ZgaXj.js
var listExams = createServerFn({ method: "GET" }).handler(createSsrRpc("928f5d631e9a8401ae133c2b689acdb7234b8e8e3bb0dcd65d8ab92fe7afd49b"));
var getExam = createServerFn({ method: "GET" }).validator((id) => id).handler(createSsrRpc("23d80bf60615fdf8fce610f9160ed9e93861f8522f8debacb988cd12b8b2ba4a"));
var getQuestionsPublic = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("cd36957d1ecf46423ab3bb5924cf57d3be72ceb3a01daf49d38d18b7f4ad54a8"));
var listQuestionTopics = createServerFn({ method: "GET" }).handler(createSsrRpc("14b983f3605c1a3c2138a76492eb6318716f842b8d19a7e3f39214261691378b"));
var startAttempt = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((examId) => examId).handler(createSsrRpc("f8c01a56b411516d39eb0b42d701753c0541977d2e629f34be59d681867a133c"));
var submitAttempt = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("7181aa7c70f6733f69ee0210027b939bfab3a75a4c3f380ed87119b72741272b"));
var getAttemptResult = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((attemptId) => attemptId).handler(createSsrRpc("b6420109b2448beb2882bb7267a2adbe7c71fbb8fec18b54c47fd913151f3d4d"));
var listMyAttempts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b96900da767a7e8525e606b69c7789f077463f705016417e650775664d5699bd"));
//#endregion
export { listMyAttempts as a, submitAttempt as c, listExams as i, getExam as n, listQuestionTopics as o, getQuestionsPublic as r, startAttempt as s, getAttemptResult as t };
