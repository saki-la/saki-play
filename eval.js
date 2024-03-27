/*
  CXP (Combinator eXPression)
  ["Sxy", n, exprX, exprY]
  ["Sx", n, exprX]
  ["S", n]
  ["Kx", n, exprX]
  ["K", n]
  ["Cxy", n, exprX, exprY]
  ["Cx", n, exprX]
  ["C", n]
  ["Bxy", n, exprX, exprY]
  ["Bx", n, exprX]
  ["B", n]
  ["I"]
  ["app", exprX, exprY]  // application
  ["var", "varName"]     // free varialble
  ["()"]       // placeholder
  ["+", json]  // JSON value (boolean, number, string or array)

  XRF (eXpression Reduction Form)
  ["Sxy", n, exprX, exprY]
  ["Sx", n, exprX, void 0]
  ["S", n, void 0, void 0]
  ["Kx", n, exprX, void 0]
  ["K", n, void 0 void 0]
  ["Cxy", n, exprX, exprY]
  ["Cx", n, exprX, void 0]
  ["C", n, void 0, void 0]
  ["Bxy", n, exprX, exprY]
  ["Bx", n, exprX, void 0]
  ["B", n, void 0, void 0]
  ["I", void 0, void 0, void 0]
  ["app", exprX, exprY, void 0]  // application
  ["var", vname, void 0, void 0]  // free varialble
  ["()"]       // placeholder
  ["+x", cxp, void 0, void 0]   // source CXP
  ["+c", xrf, void 0, void 0]   // cloning XRF
  ["+b", bool, void 0, void 0]  // JSON boolean
  ["+n", num, void 0, void 0]   // JSON number
  ["+s", str, void 0, void 0]   // JSON string
  ["+a", ary, void 0, void 0]   // JSON array
  ["+j", json, void 0, void 0]  // any other JSON
  ["+f", xrf, void 0, void 0]   // failed to convert to JSON
  
  RS (Reduction State)
  ["OK", "ND", cnt, apps]  // keep going with the reduction count (no debugging)
  ["OK", "D0", cnt, apps]  // under debugging: find comb/var
  ["OK", "D1", cnt, apps]  // under debugging: reduce a comb/var then find next
  ["OK", "V0", cnt, apps]  // under debugging: find var
  ["OK", "V1", cnt, apps]  // under debugging: reduce a var then find next
  ["DN", "OT", cnt, apps]  // done: output
  ["DN", "IA", cnt, apps]  // done: insufficient arguments
  ["DB", "D2", cnt, apps]  // debug break: stopped at comb/var
  ["DB", "V2", cnt, apps]  // debug break: stopped at var
  ["ER", "EC", cnt, apps]  // error: exceeded maximum count
  ["ER", "UV", cnt, apps]  // error: undefined variable
  ["ER", "PH", cnt, apps]  // error: reduced on placeholder
  ["ER", "NV", cnt, apps]  // error: failed to reduce by native function


  input/output example (priority order)
  (x|y| y) <-> JSON boolean false
  (x|y| x) <-> JSON boolean true
  (s| s (x|y| x) (x|y| y) (x|y| x) (x|y| y) (x|y| y) (x|y| y) (x|y| x) (x|y| y)) <-> JSON number 65
  (f|x| f 65; f|x| f 66; f|x| f 67; f|x| x) <-> text ABC
  (f|x| f (x|y| y); f|x| f 66; f|x| f 67; f|x| x) <-> JSON array [false, 66, 67]
  (f|x| f (x|y| y); f|x| f (f|x| f 66; f|x| f 67; f|x| x); f|x| x) <-> JSON array [false, "BC"]
*/

"use strict";

let library = {};
let debugSkip = new Set([]);
export const setLibrary = (lib) => { library = lib; };
export const setDebugSkip = (ds) => {
  debugSkip = new Set(ds);
};

/*-------|---------|---------|---------|---------|--------*/
// how to construct XRF
export const CXPtoXRF = (cxp) => ["+x", cxp, void 0, void 0];
//const cloneXRF = (xrf) => ["+c", xrf, void 0, void 0];
const JSONtoXRF = (json) => (({
  boolean: () => ["+b", json, void 0, void 0],
  number: () => ["+n", json, void 0, void 0],
  string: () => ["+s", json, void 0, void 0],
  object: () => (({
    "[object Array]": () => ["+a", json, void 0, void 0]
  }[toString.call(json)] ?? (
    () => ["+j", json, void 0, void 0]
  ))())
}[typeof json] ?? (() => ["+j", json, void 0, void 0]))());
/*-------|---------|---------|---------|---------|--------*/
// reduceOne calls those reduceXXX functions
// some functions call back reduceOne by tail call
// otherwise it return a tuple which has:
// - the leftmost xrf element of the entire expression
// - the state of reduction
// it need to return rather than keep calling reduceOne
// since JavaScript consumes stack on every tail call
// it returns everytime it reduce a combinator
const reduceCXP = (xrf, rstate) => {  // "+x"
  const [px, cxp, v0, v1] = xrf;
  const xrfNew = {
    Sxy: () => ["Sxy", cxp[1], CXPtoXRF(cxp[2]), CXPtoXRF(cxp[3])],
    Sx: () => ["Sx", cxp[1], CXPtoXRF(cxp[2]), void 0],
    S: () => ["S", cxp[1], void 0, void 0],
    Kx: () => ["Kx", cxp[1], CXPtoXRF(cxp[2]), void 0],
    K: () => ["K", cxp[1], void 0, void 0],
    Cxy: () => ["Cxy", cxp[1], CXPtoXRF(cxp[2]), CXPtoXRF(cxp[3])],
    Cx: () => ["Cx", cxp[1], CXPtoXRF(cxp[2]), void 0],
    C: () => ["C", cxp[1], void 0, void 0],
    Bxy: () => ["Bxy", cxp[1], CXPtoXRF(cxp[2]), CXPtoXRF(cxp[3])],
    Bx: () => ["Bx", cxp[1], CXPtoXRF(cxp[2]), void 0],
    B: () => ["B", cxp[1], void 0, void 0],
    I: () => ["I", void 0, void 0, void 0],
    app: () => ["app", CXPtoXRF(cxp[1]), CXPtoXRF(cxp[2]), void 0],
    var: () => ["var", cxp[1], void 0, void 0],
    "()": () => ["()", void 0, void 0, void 0],
    "+": () => JSONtoXRF(cxp[1])
  }[cxp[0]]();
  xrf[0] = xrfNew[0];
  xrf[1] = xrfNew[1];
  xrf[2] = xrfNew[2];
  xrf[3] = xrfNew[3];
  return reduceOne(xrf, rstate);
};  // reduceCXP
const reduceClone = (xrf, rstate) => {
  const [pc, sx, v0, v1] = xrf;
  const xrfNew = {
    Sxy: () => ["Sxy", sx[1], cloneXRF(sx[2]), cloneXRF(sx[3])],
    Sx: () => ["Sx", sx[1], cloneXRF(sx[2]), void 0],
    S: () => ["S", sx[1], void 0, void 0],
    Kx: () => ["Kx", sx[1], cloneXRF(sx[2]), void 0],
    K: () => ["K", sx[1], void 0, void 0],
    Cxy: () => ["Cxy", sx[1], cloneXRF(sx[2]), cloneXRF(sx[3])],
    Cx: () => ["Cx", sx[1], cloneXRF(sx[2]), void 0],
    C: () => ["C", sx[1], void 0, void 0],
    Bxy: () => ["Bxy", sx[1], cloneXRF(sx[2]), cloneXRF(sx[3])],
    Bx: () => ["Bx", sx[1], cloneXRF(sx[2]), void 0],
    B: () => ["B", sx[1], void 0, void 0],
    I: () => ["I", void 0, void 0, void 0],
    app: () => ["app", cloneXRF(sx[1]), cloneXRF(sx[2]), void 0],
    var: () => ["var", sx[1], void 0, void 0],
    "()": () => ["()", void 0, void 0, void 0],
    "+x": () => ["+x", sx[1], void 0, void 0],
    "+c": () => ["+c", sx[1], void 0, void 0],
    "+b": () => ["+b", sx[1], void 0, void 0],
    "+n": () => ["+n", sx[1], void 0, void 0],
    "+s": () => ["+s", sx[1], void 0, void 0],
    "+a": () => ["+a", sx[1], void 0, void 0],
    "+j": () => ["+j", sx[1], void 0, void 0],
    "+f": () => ["+f", sx[1], void 0, void 0],
    "-": () => ["-", sx[1], sx[2], sx[3]]
  }[sx[0]]();
  xrf[0] = xrfNew[0];
  xrf[1] = xrfNew[1];
  xrf[2] = xrfNew[2];
  xrf[3] = xrfNew[3];
  return reduceOne(xrf, rstate);
};  // reduceclone
/*-------|---------|---------|---------|---------|--------*/
// reduceVar replacs the variable with either one of:
// - a CXP in library
// - native function
// - a combinator
// otherwise, a undefined variable error
const reduce_ltNum = (xrfXX, rstate) => {  // native func.
  // xrfXX ["var", "ltNum", void 0, void 0]
  //const [xxvar, xxvname, xxv0, xxv1] = xrfXX;
  const [sc1, mc1, cnt1, apps1] = rstate;
  const xrfX = apps1.pop();
  if (xrfX != void 0) {
    const [xapp, xx, xy, xv0] = xrfX;  // xx == xrfXX
    // reduce subexprssion for the 1st argument (xy)
    const rstateX = [sc1, mc1, cnt1, []];
    const [, [sc2, mc2, cnt2, ]] = reduceXRF(xy, rstateX);
    const jsonX = (sc2 == "DN" && mc2 == "IA") ? (
      XRFtoJSON(xy)  // the 1st argument of ltNum or void 0
    ) : (
      void 0
    );
    if (typeof jsonX != "number") {
      // failed to get number from the subexpression
      apps1.push(xrfX);
      if (sc2 == "DB") {  // under debugging
        return [xrfXX, [sc2, mc2, cnt2, apps1]];
      } else {  // cancel reduction (fallback)
        return [xrfXX, ["ER", "NV", cnt1, apps1]];
      }
    }
    const xrf = apps1.pop();
    if (xrf != void 0) {
      const [ap, x, y, v0] = xrf;  // x == xrfX
      // reduce subexprssion for the 2nd argument (y)
      const rstateY = [sc1, mc1, cnt2, []];
      const [, [sc3, mc3, cnt3, ]] = reduceXRF(y, rstateY);
      const jsonY = (sc3 == "DN" && mc3 == "IA") ? (
        XRFtoJSON(y)  // the 2nd argument of ltNum or void 0
      ) : (
        void 0
      );
      if (typeof jsonY != "number") {
        // failed to get number from the subexpression
        apps1.push(xrf);
        apps1.push(xrfX);
        if (sc2 == "DB") {  // under debugging
          return [xrfXX, [sc2, mc2, cnt2, apps1]];
        } else {  // cancel reduction (fallback)
          return [xrfXX, ["ER", "NV", cnt1, apps1]];
        }
      }
      // the 1st and 2nd arguments are number
      xrf[0] = "+b";  // JSON boolean
      xrf[1] = (jsonX < jsonY);  // less than
      xrf[2] = void 0;
      //xrf[3] = v0;
      return [xrf, [sc1, mc1, cnt3, apps1]];
    } else {  // insufficient arguments
      apps1.push(xrfX);
      return [xrfXX, ["DN", "IA", cnt1, apps1]];
    }
  } else {  // insufficient arguments
    return [xrfXX, ["DN", "IA", cnt1, apps1]];
  }
};
const nativeFunc = {
  "ltNum": reduce_ltNum
};
const reduceVar = (xrf, rstate) => {  // "var"
  const [sc, mc, cnt, apps] = rstate;
  const v = xrf[1];
  const ntv = nativeFunc[v];  
  const lib = library[v];
  const exist = (ntv !== void 0 || lib !== void 0);
  const skip = debugSkip.has(v);
  const rsNew = (exist && !skip) ? ({
    D0: () => ["DB", "D2", cnt, apps],
    V0: () => ["DB", "V2", cnt, apps],
    D1: () => [sc, "D0", cnt, apps],
    V1: () => [sc, "V0", cnt, apps]
  }[mc] ?? (() => rstate))() : rstate;
  if (rsNew[0] != "OK")
    return [xrf, rsNew];
  if (ntv !== void 0) {
    const [xrf2, [sc2, mc2, cnt2, apps2]] = ntv(xrf, rsNew);
    if (sc2 != "ER" || mc2 != "NV" || lib === void 0)
      return [xrf2, [sc2, mc2, cnt2, apps2]];
    // fall down to library
  }
  if (lib !== void 0) {
    const newXRF = CXPtoXRF(lib);
    xrf[0] = newXRF[0];
    xrf[1] = newXRF[1];
    xrf[2] = newXRF[2];
    xrf[3] = newXRF[3];
    return [xrf, rsNew];
  } else {  // not in library
    const comb = (v.match(/^[SKCB]([1-9][0-9]*)?$/) ?? [""])[0];
    if (comb.length > 0) {  // combinators with number
      xrf[0] = comb.slice(0, 1);
      xrf[1] = comb.slice(1) ?? 1;
      xrf[2] = void 0;
      xrf[3] = void 0;
      return reduceOne(xrf, rsNew);
    } else if (v == "I") {  // I combinator
      xrf[0] = "I";
      xrf[1] = void 0;
      xrf[2] = void 0;
      xrf[3] = void 0;
      return reduceOne(xrf, rsNew);
    } else {  // undefined variable
      return [xrf, ["ER", "UV", cnt, apps]];
    }
  }
};  // reduceVar
/*-------|---------|---------|---------|---------|--------*/
// reduce JSON values as a part of XRF
const stopAtNextComb = (xrf, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  return [xrf, (mc == "D1") ? (
    [sc, "D0", cnt, apps]
  ) : (
    rstate
  )];
};
const reduceBool = (xrf, rstate) => {  // "+b"
  const [pb, b, v0, v1] = xrf;
  const [sc, mc, cnt, apps] = rstate;
  if (mc == "D0")  // stop for debugging
    return [xrf, ["DB", "D2", cnt, apps]];
  xrf[0] = (b) ? "K" : "Kx";
  xrf[1] = 1;
  xrf[2] = (b) ? void 0 : ["I", void 0, void 0, void 0];
  xrf[3] = void 0;
  return stopAtNextComb(xrf, rstate);
};
const reduceNum = (xrf, rstate) => {  // "+n"
  // (s| s b0 b1 b2 b3 b4 b5 b6 b7)  unsigned 8 bit intenger
  // => C (C (C (C (C (C (C (C I b0) b1) b2) b3) b4) b5) b6) b7
  const [pn, num, v0, v1] = xrf;
  const [sc, mc, cnt, apps] = rstate;
  if (apps.length >= 1) {
    if (mc == "D0")  // stop for debugging
      return [xrf, ["DB", "D2", cnt, apps]];
    const i = ["I", void 0, void 0, void 0];
    const k = ["K", 1, void 0, void 0];
    const ki = ["Kx", 1, i, void 0];
    let x = i;    // to become XRF
    let n = num;  // integer
    for (let c = 0; c < 8; ++c) {
      x = ["Cxy", 1, x, (n & 1) == 1 ? k : ki];
      n >>= 1;
    }
    xrf[0] = x[0];
    xrf[1] = x[1];
    xrf[2] = x[2];
    xrf[3] = x[3];
    return stopAtNextComb(xrf, rstate);
  } else {  // insufficient arguments
    // end reduction without converting to combinators
    // this helps XRFtoJSON and native functions i.e. ltNum
    return [xrf, ["DN", "IA", cnt, apps]];
  }
};  // reduceNum
const reduceStr = (xrf, rstate) => {
  // xrf ["+s", str, v0, v1]
  const [ps, str, v0, v1] = xrf;
  const [sc, mc, cnt, apps] = rstate;
  if (mc == "D0")  // stop for debugging
    return [xrf, ["DB", "D2", cnt, apps]];
  const u8a = new TextEncoder().encode(str);
  xrf[0] = "+a"; // JSON array
  xrf[1] = [...u8a]; // convert it into an array
  //xrf[2] = v0;
  //xrf[3] = v1;
  return stopAtNextComb(xrf, rstate);
};
const reduceArray = (xrf, rstate) => {  // "+a"
  //    [e0, e1, e2]
  // => (f|x| f e0; f|x| f e1; f|x| e2; f|x| x)
  // => B K (C (C I e0); B K; C (C I e1); B K; C (C I e2); K I)
  const [pa, ary, v0, v1] = xrf;
  const [sc, mc, cnt, apps] = rstate;
  if (mc == "D0")  // stop for debugging
    return [xrf, ["DB", "D2", cnt, apps]];
  if (ary.length > 0) {
    const [e0, ...rest] = ary;
    xrf[0] = "Bxy";
    xrf[1] = 1;
    xrf[2] = ["K", 1, void 0, void 0];
    xrf[3] = [
      "Cxy", 1, [
        "Cxy", 1, [
          "I", void 0, void 0, void 0
        ], JSONtoXRF(e0)
      ], [
        "+a", rest, void 0, void 0
      ]
    ];
  } else {  // empty array
    xrf[0] = "Kx";
    xrf[1] = 1;
    xrf[2] = ["I", void 0, void 0, void 0];
    xrf[3] = void 0;
  }
  return stopAtNextComb(xrf, rstate);
};  // reduceArray
/*-------|---------|---------|---------|---------|--------*/
const reduceSxy = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    if (mc == "D0")  // stop for debugging
      return [xrf, ["DB", "D2", cnt, apps]];
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [sxy, xn, xx, xy] = xrfX;
    if (xn >= 2) {
      xrf[0] = sxy;
      xrf[1] = xn - 1;
      xrf[2] = [app, xx, y, v1];
      xrf[3] = [app, xy, y, v1];
      return reduceSxy(xrf, rstate);
    } else {  // xn == 1
      //xrf[0] = app;
      xrf[1] = [app, xx, y, v1];
      xrf[2] = [app, xy, y, v1];
      //xrf[3] = v1;
      apps.push(xrf);
      apps.push(xrf[1]);
      return stopAtNextComb(xx, rstate);
    }
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};  // reduceSxy
const reduceSx = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [sx, xn, xx, xv1] = xrfX;
    xrf[0] = "Sxy";
    xrf[1] = xn;
    xrf[2] = xx;
    xrf[3] = y;
    return reduceSxy(xrf, rstate);
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};
const reduceS = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [s, xn, xv1, xv2] = xrfX;
    xrf[0] = "Sx";
    xrf[1] = xn;
    //xrf[2] = y;
    //xrf[3] = v1;
    return reduceSx(xrf, rstate);
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};
const reduceKx = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    if (mc == "D0")  // stop for debugging
      return [xrf, ["DB", "D2", cnt, apps]];
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [kx, xn, xx, xv1] = xrfX;
    if (xn >= 2) {
      xrf[0] = kx;
      xrf[1] = xn - 1;
      xrf[2] = xx;
      //xrf[3] = v1;
      return reduceKx(xrf, rstate);
    } else {  // xn == 1
      xrf[0] = xx[0];
      xrf[1] = xx[1];
      xrf[2] = xx[2];
      xrf[3] = xx[3];
      return stopAtNextComb(xrf, rstate);
    }
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};  // reduceKx
const reduceK = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [k, xn, xv1, xv2] = xrfX;
    xrf[0] = "Kx";
    xrf[1] = xn;
    //xrf[2] = y;
    //xrf[3] = v1;
    return reduceKx(xrf, rstate);
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};
const reduceCxy = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    if (mc == "D0")  // stop for debugging
      return [xrf, ["DB", "D2", cnt, apps]];
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [cxy, xn, xx, xy] = xrfX;
    if (xn >= 2) {
      xrf[0] = cxy;
      xrf[1] = xn - 1;
      xrf[2] = [app, xx, y, v1];
      xrf[3] = xy;
      return reduceCxy(xrf, rstate);
    } else {  // xn == 1
      //xrf[0] = app;
      xrf[1] = [app, xx, y, v1];
      xrf[2] = xy;
      //xrf[3] = v1;
      apps.push(xrf);
      apps.push(xrf[1]);
      return stopAtNextComb(xx, rstate);
    }
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};  // reduceCxy
const reduceCx = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [cx, xn, xx, xv1] = xrfX;
    xrf[0] = "Cxy";
    xrf[1] = xn;
    xrf[2] = xx;
    xrf[3] = y;
    return reduceCxy(xrf, rstate);
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};
const reduceC = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [c, xn, xv1, xv2] = xrfX;
    xrf[0] = "Cx";
    xrf[1] = xn;
    //xrf[2] = y;
    //xrf[3] = v1;
    return reduceCx(xrf, rstate);
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};
const reduceBxy = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    if (mc == "D0")  // stop for debugging
      return [xrf, ["DB", "D2", cnt, apps]];
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [bxy, xn, xx, xy] = xrfX;
    if (xn >= 2) {
      xrf[0] = bxy;
      xrf[1] = xn - 1;
      xrf[2] = xx;
      xrf[3] = [app, xy, y, v1];
      return reduceBxy(xrf, rstate);
    } else {  // xn == 1
      //xrf[0] = app;
      xrf[1] = xx;
      xrf[2] = [app, xy, y, v1];
      //xrf[3] = v1;
      apps.push(xrf);
      return stopAtNextComb(xx, rstate);
    }
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};  // reduceBxy
const reduceBx = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;   // x == xrfX
    const [bx, xn, xx, xv1] = xrfX;
    xrf[0] = "Bxy";
    xrf[1] = xn;
    xrf[2] = xx;
    xrf[3] = y;
    return reduceBxy(xrf, rstate);
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};
const reduceB = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [b, xn, xv1, xv2] = xrfX;
    xrf[0] = "Bx";
    xrf[1] = xn;
    //xrf[2] = y;
    //xrf[3] = v1;
    return reduceBx(xrf, rstate);
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};
const reduceI = (xrfX, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  const xrf = apps.pop();
  if (xrf != void 0) {
    if (mc == "D0")  // stop for debugging
      return [xrf, ["DB", "D2", cnt, apps]];
    const [app, x, y, v1] = xrf;  // x == xrfX
    xrf[0] = y[0];
    xrf[1] = y[1];
    xrf[2] = y[2];
    xrf[3] = y[3];
    return stopAtNextComb(xrf, rstate);
  } else {  // insufficient arguments
    return [xrfX, ["DN", "IA", cnt, apps]];
  }
};
/*-------|---------|---------|---------|---------|--------*/
const reduceApp = (xrf, rstate) => {  // "app"
  const [sc, mc, cnt, apps] = rstate;
  apps.push(xrf);
  return reduceOne(xrf[1], rstate);
};
const reducePH = (xrf, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  return [xrf, ["ER", "PH", cnt, apps]];
};
const reduceJSON = (xrf, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  return [xrf, ["ER", "JS", cnt, apps]];
};
const reduceOutput = (xrf, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  return [xrf, ["DN", "OT", cnt, apps]];
};
const reduceNonJSON = (xrf, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  return [xrf, ["DN", "IA", cnt, apps]];
};
const reduceMap = {  // reduce one step
  Sxy: reduceSxy,
  Sx: reduceSx,
  S: reduceS,
  Kx: reduceKx,
  K: reduceK,
  Cxy: reduceCxy,
  Cx: reduceCx,
  C: reduceC,
  Bxy: reduceBxy,
  Bx: reduceBx,
  B: reduceB,
  I: reduceI,
  app: reduceApp,
  var: reduceVar, // variables
  "()": reducePH, // placeholder
  "+x": reduceCXP, // source CXP
  "+c": reduceClone, // cloning XRF
  "+b": reduceBool, // JSON boolean
  "+n": reduceNum, // JSON numbers
  "+s": reduceStr, // JSON strings
  "+a": reduceArray, // JSON arrays
  "+j": reduceJSON, // other JSON types
  "+f": reduceNonJSON, // non-JSON types
  "-": reduceOutput // sentinel to output
};
const reduceOne = (xrf, rstate) => reduceMap[xrf[0]](xrf, rstate);
export const reduceXRF = (rstate) => {
  let [sc, mc, cnt, apps] = rstate;
  if (mc != "D2" && mc != "V2") {
    let xrf = apps.pop();
    do {  // reduction loop
      [xrf, [sc, mc, cnt, apps]] = reduceOne(xrf, [sc, mc, cnt, apps]);
    } while (sc == "OK" && --cnt > 0);
    apps.push[xrf];
  }
  if (sc != "OK" || cnt > 0)
    return [sc, mc, cnt, apps];
  else
    return ["ER", "EC", cnt, apps];  // too many reductions
};
/*-------|---------|---------|---------|---------|--------*/
export const XRFtoCXP = (xrf) => ({
  Sxy: () => ["Sxy", xrf[1], XRFtoCXP(xrf[2]), XRFtoCXP(xrf[3])],
  Sx: () => ["Sx", xrf[1], XRFtoCXP(xrf[2])],
  S: () => ["S", xrf[1]],
  Kx: () => ["Kx", xrf[1], XRFtoCXP(xrf[2])],
  K: () => ["K", xrf[1]],
  Cxy: () => ["Cxy", xrf[1], XRFtoCXP(xrf[2]), XRFtoCXP(xrf[3])],
  Cx: () => ["Cx", xrf[1], XRFtoCXP(xrf[2])],
  C: () => ["C", xrf[1]],
  Bxy: () => ["Bxy", xrf[1], XRFtoCXP(xrf[2]), XRFtoCXP(xrf[3])],
  Bx: () => ["Bx", xrf[1], XRFtoCXP(xrf[2])],
  B: () => ["B", xrf[1]],
  I: () => ["I"],
  app: () => ["app", XRFtoCXP(xrf[1]), XRFtoCXP(xrf[2])],
  var: () => ["var", xrf[1]],
  "()": () => ["()"],
  "+x": () => xrf[1],
  "+c": () => XRFtoCXP(xrf[1]),
  "+b": () => ["+", xrf[1]],
  "+n": () => ["+", xrf[1]],
  "+s": () => ["+", xrf[1]],
  "+a": () => ["+", xrf[1]],
  "+j": () => ["+", xrf[1]],
  "+f": () => XRFtoCXP(xrf[1]),
}[xrf[0]]());  // XRFtoCXP
const NtoStr = (n) => (n == 1 ? "" : "" + n);
const CXPtoStr = (cxp) => ({
  Sxy: () => "(S" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + " " +
  CXPtoStr(cxp[3]) + ")",
  Sx: () => "(S" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  S: () => "S" + NtoStr(cxp[1]),
  Kx: () => "(K" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  K: () => "K" + NtoStr(cxp[1]),
  Cxy: () =>
  "(C" +
  NtoStr(cxp[1]) +
  " " +
  CXPtoStr(cxp[2]) +
  " " +
  CXPtoStr(cxp[3]) +
  ")",
  Cx: () => "(C" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  C: () => "C" + NtoStr(cxp[1]),
  Bxy: () =>
  "(B" +
  NtoStr(cxp[1]) +
  " " +
  CXPtoStr(cxp[2]) +
  " " +
  CXPtoStr(cxp[3]) +
  ")",
  Bx: () => "(B" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  B: () => "B" + NtoStr(cxp[1]),
  I: () => "I",
  app: () => "(" + CXPtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  var: () => cxp[1],
  "()": () => "()",
  "+": () => JSON.stringify(cxp[1])
}[cxp[0]]());  // CXPtoStr
const XRFtoComb = (mode, xrf) => {  // stringify XRF in combinator form
  if (mode.outputComb) {
    return CXPtoStr(XRFtoCXP(xrf));
  } else {
    return XRFtoCXP(xrf);
  }
};
const AryToStr = (mode, json) => {
  if (
    mode.outputStr &&
    toString.call(json) == "[object Array]" &&
    json.reduce((a, e) => a && typeof e == "number", true)
  ) {
    const u8a = new Uint8Array(json);
    return new TextDecoder().decode(u8a); // UTF-8
  } else {
    return json;
  }
};
const myDebugStep = (debugStep0) => (
  (debugStep0 != 0) ? ((mode) => {
    const [json, rstate, debugStep1] = debugStep0(mode);
    const [mc, sc, cnt, apps] = rstate;
    const str = AryToStr(mode, json) ?? XRFtoComb(mode, apps[0]);
    return [str, rstate, myDebugStep(debugStep1)];
  }) : void 0;
);
const SourceCXPtoStr = (rstate) => {
  let [mc, sc, cnt, apps] = rstate;
  (mode) => 
};

export const XRFtoStr = (mode, rstate) => {
  // converts a XRF into the string in the specified mode
  // XRF may (or may not) be reduced based on the state
  // the reduction can be stopped when in the debug state
  // even if it is stopped, it coverts the entire XRF
  // returns the coverted string and the next function
  let [mc, sc, cnt, apps] = rstate;

  // easier way to convert
  const json = ({
    "+x": () => {        // source CXP
      return SourceCXPtoStr(rstate)(mode);
      
      return (sc == "DN" && mc == "IA") ? (
        XRFtoJSON(mode, xrf0)
      ) : (
        void 0
      );
    },
    "+b": () => xrf0[1],  // JSON boolean
    "+n": () => xrf0[1],  // JSON number
    "+s": () => xrf0[1],  // JSON string
    "+a": () => xrf0[1],  // JSON array
    "+j": () => xrf0[1]   // any other JSON
  }[xrf0[0]] ?? (() => void 0))();
  if (json !== void 0) {  // JSON value
    return [json, ["DN", "IA", cnt, apps], void 0];
  } else if (xrf0[0] == "+f") {
    return void 0;  // already failed to convert
  }

  // harder way to convert (avoid retrying it)
  const failedToConvertJSON = ()=> {
    xrf0[1] = [...xrf0];
    xrf0[0] = "+f";
    xrf0[2] = void 0;
    xrf0[3] = void 0;
    return void 0;
  };

  // recognize output by placing a sentinel
  const xrf1 = [
    "app", xrf0, [
      "-", 0, void 0, void 0  // sentinel#0 to output
    ], void 0
  ];
  let [[sentl, sentlData], [sc, mc, cnt, apps]] = reduceXRF(xrf1);  // internal for output
  if (sc != "DN") return failedToConvertJSON();

  // first check whether it is a number such as:
  //   (s| s K (K I) (K I) (K I) (K I) (K I) K (K I))
  //   => 65 = 0x41 = 0b01000001 = 'A'
  if (sc == "DN" && mc == "OT" && apps.length == 8) {  // it may be a number
    let u8 = 0; // unsigned 8 bits integer
    let bc = 0;
    for (let c = xrf1; c[0] == "app"; c = c[1], ++bc) {
      const [[sl, sld], [, , , ap]] = reduceXRF([  // internal for output
        "app", [
          "app", c[2], [
            "-", 1, void 0, void 0   // sentinel to output 1
          ], void 0
        ], [
          "-", 0, void 0, void 0  // sentinel to output 0
        ], void 0
      ]);
      if (sl === "-" && ap.length == 0) {
        u8 = (u8 << 1) | sld;  // bitwise shift and or
      } else {
        u8 = void 0;  // it was not a number
        break;
      }
    }
    if (u8 !== void 0 && bc == 8) {  // it was a number
      xrf0[0] = "+n";
      xrf0[1] = u8;
      xrf0[2] = void 0;
      xrf0[3] = void 0;
      return u8;
    }
  }

  // give another sentinel to check boolean or array
  const xrf2 = [
    "app", xrf1, [
      "-", 1, void 0, void 0  // sentinel#1 to output
    ], void 0
  ];
  [[sentl, sentlData], [sc, mc, cnt, apps]] = reduceXRF(xrf2);  // internal for output
  if (sc != "DN") return failedToConvertJSON();

  if (sc == "DN" && mc == "OT") {
    if (apps.length == 0) {  // boolean or an end of array (f|x| x)
      const b = (sentlData == 0);  // 0: true, 1: false
      xrf0[0] = "+b";
      xrf0[1] = b;
      xrf0[2] = void 0;
      xrf0[3] = void 0;
      return b;
    } else {
      const [app, x, y] = xrf2;
      if (apps.length == 2 && app == "app" && sentlData == 0) {
        const [appX, xx, xy] = x;
        if (appX == "app") {
          // f|x| f data subArray
          const data = AryToStr(mode, XRFtoJSON(mode, xy));
          if (data !== void 0) {
            const subAr = XRFtoJSON(mode, y);
            let a = void 0;
            if (toString.call(subAr) == "[object Array]") {
              a = [data].concat(subAr);
            } else if (typeof subAr == "boolean" && !subAr) {  // subAr is false
              a = [data];
            }
            if (a != void 0) {
              xrf0[0] = "+a";
              xrf0[1] = a;
              xrf0[2] = void 0;
              xrf0[3] = void 0;
              return a;
            }
          }
        }
      }
    }
  }

  // give some more sentinels to check LCX
  //         0   1   2  3 4 5 6 7 8
  //   xrf lam app var ph s k c b i
  const xrf3 = [
    "app", [
      "app", [
        "app", [
          "app", [
            "app", [
              "app", [
                "app", [
                  "app", xrf2, [  // sentinel#0 and #1
                    "-", 2, void 0, void 0  // sentinel#2 to output
                  ], void 0
                ], [
                  "-", 3, void 0, void 0  // sentinel#3 to output
                ], void 0
              ], [
                "-", 4, void 0, void 0  // sentinel#4 to output
              ], void 0
            ], [
              "-", 5, void 0, void 0  // sentinel#5 to output
            ], void 0
          ], [
            "-", 6, void 0, void 0  // sentinel#6 to output
          ], void 0
        ], [
          "-", 7, void 0, void 0  // sentinel#7 to output
        ], void 0
      ], [
        "-", 8, void 0, void 0  // sentinel#8 to output
      ], void 0
    ], [
      "-", 9, void 0, void 0  // sentinel#9 to output
    ], void 0
  ];  // xrf3
  [[sentl, sentlData], [sc, mc, cnt, apps]] = reduceXRF(xrf3);  // internal for output
  if (sc != "DN") return failedToConvertJSON();

  if (sc == "DN" && mc == "OT") {
    const ret = [
      () => {  // 0: lam v x vf (lambda)
        const [app, x, y] = xrf3;
        const [appX, xx, xy] = x;
        const [appXX, xxx, xxy] = xx;
        if (
          apps.length == 3 &&
          app == "app" &&
          appX == "app" &&
          appXX == "app"
        ) {
          const lcxV = AryToStr(mode, XRFtoJSON(mode, xxy));  // variable name
          const lcxX = XRFtoJSON(mode, xy); // expression
          const lcxVF = XRFtoJSON(mode, y); // array of string
          if (lcxV != void 0 && lcxX != void 0 && lcxVF != void 0)
            return ["LCX:lam", lcxV, lcxX, lcxVF];
        }
        return void 0;
      },
      () => {  // 1: app x y vf (application)
        const [app, x, y] = xrf3;
        const [appX, xx, xy] = x;
        const [appXX, xxx, xxy] = xx;
        if (
          apps.length == 3 &&
          app == "app" &&
          appX == "app" &&
          appXX == "app"
        ) {
          const lcxX = XRFtoJSON(mode, xxy);  // expression x
          const lcxY = XRFtoJSON(mode, xy);   // expression y
          const lcxVF = XRFtoJSON(mode, y);   // array of string
          if (lcxX != void 0 && lcxY != void 0 && lcxVF != void 0)
            return ["LCX:app", lcxX, lcxY, lcxVF];
        }
        return void 0;
      },
      () => {  // 2: var v (variable)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxV = AryToStr(mode, XRFtoJSON(mode, y));  // variable name
          if (lcxV != void 0) return ["LCX:var", lcxV];
        }
        return void 0;
      },
      () => {  // 3: js j (JSON value)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxJ = AryToStr(mode, XRFtoJSON(mode, y));  // JSON value
          if (lcxJ != void 0) return ["LCX:+", lcxJ];
        }
        return void 0;
      },
      () => {  // 4: ph (placeholder)
        if (apps.length == 0) {
          return ["LCX:()"];
        }
        return void 0;
      },
      () => {  // 5: s n (Sn combinator)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxN = XRFtoJSON(mode, y);  // n
          if (lcxN != void 0) return ["LCX:S", lcxN];
        }
        return void 0;
      },
      () => {  // 6: k n (Kn combinator)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxN = XRFtoJSON(mode, y);  // n
          if (lcxN != void 0) return ["LCX:K", lcxN];
        }
        return void 0;
      },
      () => {  // 7: c n (Cn combinator)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxN = XRFtoJSON(mode, y);  // n
          if (lcxN != void 0) return ["LCX:C", lcxN];
        }
        return void 0;
      },
      () => {  // 8: b n (Bn combinator)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxN = XRFtoJSON(mode, y);  // n
          if (lcxN != void 0) return ["LCX:B", lcxN];
        }
        return void 0;
      },
      () => {  // 9: i (I combinator)
        if (apps.length == 0) {
          return ["LCX:I"];
        }
        return void 0;
      }
    ][sentlData]();
    if (ret != void 0) {
    //  xrf0[0] = "+a";
    //  xrf0[1] = ret;
    //  xrf0[2] = void 0;
    //  xrf0[3] = void 0;
      return ret; 
    }
  }
  //return failedToConvertJSON();
  return void 0;
};  // XRFtoJSON



export const XRFtoStr = (mode, rstate) => {  // stringify XRF in JSON
  const mode0 = { ...mode };
  const [mc0, sc0, cnt0, apps0] = rstate;
  if (mode0.outputJSON) {
    const [json1, [mc1, sc1, cnt1, apps1], debugStep1] = (
      XRFtoJSON(mode0, [mc0, sc0, cnt0, apps0])
    );
    const myDebugStep = (json, mc, sc, cnt, apps, debugStep) => {
      



    }) : void 0;
    const str = AryToStr(mode0, json1);
    if (str !== void 0) {
      return [str, [mc1, sc1, cnt1, apps1], void 0];
    } else {
      return XRFtoComb(mode0, apps1[0])
    }
        
      
      return str;
  }
  return XRFtoComb(mode, xrf);
};
