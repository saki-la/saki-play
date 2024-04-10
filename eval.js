/*
  evalXRF - evaluates XRF strictly and makes value as the result
  reduceXRF - reduces XRF according to rules

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
  ["+b", bool, void 0, void 0]  // JSON boolean; false/true
  ["+n", num, void 0, void 0]   // JSON number; 0..255
  ["+s", str, void 0, void 0]   // JSON string; "abc"
  ["+a", ary, void 0, void 0]   // JSON array; [x, y, z]
  ["+j", json, void 0, void 0]  // any other JSON (null or object)
  ["+.", index, cnt, void 0]    // selector; i.d.p (e.g. 0.2.0 == K)
  ["+u", xrf, void 0, void 0]   // unevaluable (pseudo parameters did not work)
  ["-", num, void 0, void 0]    // pseudo paramter; <a>

  rstate (Reduction State)
  ["OK", "ND", cnt, apps]  // keep going with the reduction count (no debugging)
  ["OK", "D0", cnt, apps]  // under debugging: find comb/var
  ["OK", "D1", cnt, apps]  // under debugging: reduce a comb/var then find next
  ["OK", "V0", cnt, apps]  // under debugging: find var
  ["OK", "V1", cnt, apps]  // under debugging: reduce a var then find next
  ["IA",     , cnt, apps]  // done reduction: insufficient arguments 
  ["OT",     , cnt, apps]  // done reduction: output
  ["DB", "D2", cnt, apps]  // debug break: stopped at comb/var
  ["DB", "V2", cnt, apps]  // debug break: stopped at var
  ["ER", "EC", cnt, apps]  // error: exceeded maximum count
  ["ER", "UV", cnt, apps]  // error: undefined variable
  ["ER", "PH", cnt, apps]  // error: reduced on placeholder
  ["ER", "NV", cnt, apps]  // error: failed to reduce by native function
  ["ER", "IE", cnt, apps]  // error: internal error (a bug in the code)



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
//
// reduceCXP converts CXP into XRF as necessary
// unused CXP will not be converted
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
export const reduceXRF = (xrf, rstate) => {
  let [sc, mc, cnt, apps] = rstate;
  while (sc == "OK" && --cnt > 0)  {
    [xrf, [sc, mc, cnt, apps]] = reduceOne(xrf, [sc, mc, cnt, apps]);
  }
  if (sc == "OK" && cnt <= 0)  // too many reductions
    return [xrf, ["ER", "EC", cnt, apps]];
  else
    return [xrf, [sc, mc, cnt, apps]];
};
/*-------|---------|---------|---------|---------|--------*/
// the pseudo parameters is used to convert into a selector
//
// an example of selector is:
//   a|b|c|d| c x y
// it selects c from the arguments a, b, c and d
// note that c takes two parameters x and y in the example
// the expression will be converted to:
//   2.4.2 x y
// the dot ternary operator indicates it is a selector
// in the form of "i.d.p":
//   i is the 0 based index of the selector
//   d is the denominator (the number of arguments)
//   p is the number of parameters of the selector
// and, the selector can be converted to the combinators as:
//   K2 (B K; C (C I x) y)
//
// some selector can be convertd to JSON
//   a|b| b
// by using the selector, this can be converted to:
//   1.2.0
// it will be specially converted to a JSON value; false
// 
// another example is to convert to JSON array:
//    f|x| f e1; f|x| f e2; f|x| x
// => 0.2.2 e1; 0.2.2 e2 1.2.0
// => [e1, e2]
//
// 




// 
// 
// for example, "K I" will be converted to "false"
// it adds one or more pseudo parameters to the expr
// then reduces it until the pseudo parameters appear
// the value is determined by which parameter appears
const hasPseudoParam =  (xrf) => ({
  Sxy: () => hasPseudoParam(xrf[2]) || hasPseudoParam(xrf[3]),
  Sx: () => hasPseudoParam(xrf[2]),
  Kx: () => hasPseudoParam(xrf[2]),
  Cxy: () => hasPseudoParam(xrf[2]) || hasPseudoParam(xrf[3]),
  Cx: () => hasPseudoParam(xrf[2]),
  Bxy: () => hasPseudoParam(xrf[2]) || hasPseudoParam(xrf[3]),
  Bx: () => hasPseudoParam(xrf[2]),
  app: () => hasPseudoParam(xrf[1]) || hasPseudoParam(xrf[2]),
  "-": () => true  // pseudo paramter; <a>
}[xrf[0]] && () => false)();
const cancelPseudoParam = (xrf, mc, cnt) => {
  const [plusp, apps, ppcnt, org] = xrf;
  xrf[0] = "+f";  // pseudo parameters did not work
  xrf[1] = org;   // original XRF
  xrf[2] = void 0;
  xrf[3] = void 0;
  return [xrf, ["IA", mc, cnt, []]];
};
const reduceExprWithPP = (xrf0, rstate0) => {
  const [sc0, mc0, cnt0, apps0] = rstate0;
  console.assert(apps0.length == 0);
  const [plusp, apps, ppcnt, org] = xrf0;
  const xrf = apps.pop();
  const rstate = [sc0, mc0, cnt0, apps];
  const [xrf1, rstate1] = reduceXRF(xrf, rstate);
  const [sc1, mc1, cnt1, apps1] = rstate1;
  return ({
    "IA": () => {
      if (ppcnt + 1 <= 64) {  // add another parameter
        apps1.push(xrf1);
        const org1 = apps1[0];
        apps1.unshift([
          "app", org1, [
            "-", ppcnt, void 0, void 0
          ], void 0
        ]);
        //xrf0[0] = "+p";
        console.assert(plus == "+p");
        xrf0[1] = apps1;
        xrf0[2] = ppcnt + 1;
        xrf0[3] = org;
        return reduceExprWithPP(xrf0, ["OK", mc1, cnt1, []]);
      } else {  // pseudo parameters did not work 
        return cancelPseudoParam(xrf0, mc1, cnt1)
      }
    },
    "OT": () => {
      let hasPP = false;
      if (apps1.length > 0) {
        let [app, x, y, v0];
        x = apps1[0];
        let [sc, mc, cnt]  = ["IA", mc1, cnt1];
        do {
          [app, x, y, v0] = x;
          hasPP = hasPseudoParam(y);
          if (!hasPP) {
            [, [sc, mc, cnt,]] = reduceXRF(y, ["OK", mc, cnt, []]);
          }
        } while (x !== xrf1 && !hasPP && sc == "IA");
        if (sc != "IA")
          return [xrf0, [sc, mc, cnt, apps0]];
      }
      if (hasPP) {
        return cancelPseudoParam(xrf0, mc1, cnt1);
      } else {  // replace it with a selector
        /*
          T[p1..pn|s|q1..qm| s x1..xk]
        = T[p1..pn|s| Km; s x1..xk]
        = T[p1..pn| B Km T[s| s x1..xk]]
        = Kn (B Km; C (..(C I x1)..) xk)
        where
          n = num
          m = ppcnt - num - 1
          k = apps1.length
          p1..pn, s and q1..qm is not free in x1..xk
        */
        const [minus, index, v0, v1] = xrf1;  // pseudo paramter; <a>
        xrf1[0] = "+/";   // selector (Kn Km); index/count (n/(n+m+1))
        xrf1[1] = index;  // pseudo paramter index
        xrf1[2] = ppcnt;  // number of pseudo paramters
        xrf1[3] = apps1.length;
        return [xrf1, ["IA", mc1, cnt1, apps1]];
      }
    },
    "DB": () => [xrf1, rstate1],
    "ER": () => [xrf1, rstate1]
  }[sc1] ?? (
    () => [xrf1, ["ER", "IE", cnt1, apps1]]  // internal error
  ))();
};
const addPseudoParam = (xrf, rstate) => {
  const [sc, mc, cnt, apps] = rstate;
  apps.push([...xrf]);
  const org = apps[0];  // original expression
  apps.unshift([
    "app", org, [
      "-", 0, void 0, void 0
    ], void 0
  ]);
  xrf[0] = "+p";  // expression with pseudo parameters
  xrf[1] = apps;  // application stack
  xrf[2] = 1;     // number of pseudo parameters
  xrf[3] = org;   // original expression
  return reducePseudoParam(xrf, [sc, mc, cnt, []]);
};  // addPseudoParam
const evX_reduce = (xrf0, rstate0) => {
  const [xrf1, rstate1] = reduceXRF(xrf0, rstate0);
  const [sc1, mc1, cnt1, apps1] = rstate1;
  const rstate2 = [sc1, "D1", 
  apps1.push(xrf1);
  const xrfResult = apps1[0];
  return ({
    "IA": () => {
    },
    "OT": () => {
    },
    "DB": () => ["SC", "DB", cnt1,   // Debug Break
    },
    "ER": () => [xrfResult, sc1, mc1, cnt1, void 0]
  }[sc1] ?? (() => [xrfResult, "ER", "IE", cnt1, void 0]));
};
const evalXRF = (xrf0, db0, cnt0) => (
  const mc0 = ({
    "ND": "D0"
  evX_reduce(xrf0, ["OK", mc0, cnt0, []])
);  // evalXRF
/*-------|---------|---------|---------|---------|--------*/

