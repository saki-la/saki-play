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
  

  input/output example (priority order)
  (x|y| y) <-> JSON boolean false
  (x|y| x) <-> JSON boolean true
  (s| s (x|y| x) (x|y| y) (x|y| x) (x|y| y) (x|y| y) (x|y| y) (x|y| x) (x|y| y)) <-> JSON number 65
  (f|x| f 65; f|x| f 66; f|x| f 67; f|x| x) <-> text ABC
  (f|x| f (x|y| y); f|x| f 66; f|x| f 67; f|x| x) <-> JSON array [false, 66, 67]
  (f|x| f (x|y| y); f|x| f (f|x| f 66; f|x| f 67; f|x| x); f|x| x) <-> JSON array [false, "BC"]
*/

"use strict";
import { intrinsic } from 'https://saki-la.github.io/saki-play/intrinsic.js';
import { parse } from 'https://saki-la.github.io/saki-play/sakiMin.pegjs.js';
import { pegToLXP } from 'https://saki-la.github.io/saki-play/PEGToLXP.js';
import { LXPtoCXP } from 'https://saki-la.github.io/saki-play/LXPtoCXP.js';

let outputJSON = true;  // output in JSON representation
let outputComb = true;  // output in combinator form
let outputStr = true;   // output as string (no escapes)
let compact = true;  // compacted JSON (no CRs or spaces)
let nextCXP = void 0;  // debug mode if undefined

let forceLXP = false;

const library = Object.assign(intrinsic, {
  // sub2 F F F F F (r0|r1|b| f|x| f r0; f|x| f r1; f|x| f b; f|x| x)
  "inc8nc": ["Cxy",8,["Cxy",8,["var","inc8"],["var","T"]],["Bxy",8,["K",1],["Bxy",7,["C",1],["Bxy",6,["C",1],["Bxy",5,["C",1],["Bxy",4,["C",1],["Bxy",3,["C",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]]],
});

const CXPtoXRF = (cxp) => ["+x", cxp, void 0, void 0];
const JSONtoXRF = (json) => ({
  "boolean": () => ["+b", json, void 0, void 0],
  "number":  () => ["+n", json, void 0, void 0],
  "string":  () => ["+s", json, void 0, void 0],
  "object": () => ({
    "[object Array]": () => ["+a", json, void 0, void 0]
  }[toString.call(json)] ?? (() => ["()", void 0, void 0, void 0]))()
}[typeof json] ?? (() => ["()", void 0, void 0, void 0]))();

const reduceCXP = (xrf, apps) => {  // xrf ["+x", cxp, v0, v1]
  const [px, cxp, v0, v1] = xrf;
  const newXRF = ({
    "Sxy": () => ["Sxy", cxp[1], CXPtoXRF(cxp[2]), CXPtoXRF(cxp[3])],
    "Sx": () => ["Sx", cxp[1], CXPtoXRF(cxp[2]), void 0],
    "S": () => ["S", cxp[1], void 0, void 0],
    "Kx": () => ["Kx", cxp[1], CXPtoXRF(cxp[2]), void 0],
    "K": () => ["K", cxp[1], void 0, void 0],
    "Cxy": () => ["Cxy", cxp[1], CXPtoXRF(cxp[2]), CXPtoXRF(cxp[3])],
    "Cx": () => ["Cx", cxp[1], CXPtoXRF(cxp[2]), void 0],
    "C": () => ["C", cxp[1], void 0, void 0],
    "Bxy": () => ["Bxy", cxp[1], CXPtoXRF(cxp[2]), CXPtoXRF(cxp[3])],
    "Bx": () => ["Bx", cxp[1], CXPtoXRF(cxp[2]), void 0],
    "B": () => ["B", cxp[1], void 0, void 0],
    "I": () => ["I", void 0, void 0, void 0],
    "app": () => ["app", CXPtoXRF(cxp[1]), CXPtoXRF(cxp[2]), void 0],
    "var": () => ["var", cxp[1], void 0, void 0],
    "()": () => ["()", void 0, void 0, void 0],
    "+": ()=> JSONtoXRF(cxp[1])
  }[cxp[0]])();
  xrf[0] = newXRF[0];
  xrf[1] = newXRF[1];
  xrf[2] = newXRF[2];
  xrf[3] = newXRF[3];
  return reduceOne(xrf, apps);
};  // reduceCXP
const reduceVar = (xrf, apps) => {  // xrf ["var", v, v0, v1]
  const v = xrf[1];
  const fn = library[v];
  if (fn !== void 0) {
    const newXRF = CXPtoXRF(fn);
    xrf[0] = newXRF[0];
    xrf[1] = newXRF[1];
    xrf[2] = newXRF[2];
    xrf[3] = newXRF[3];
    return [true, xrf, apps];
  } else {  // not in library
    const comb = (v.match(/^[SKCB]/) ?? [null])[0];
    const n = (v.slice(1).match(/^[0-9]+/) ?? [null])[0];
    if (comb) {  // combinators
      xrf[0] = comb;
      xrf[1] = n ? +n : 1;
      xrf[2] = void 0;
      xrf[3] = void 0;
      return [true, xrf, apps];
    } else if (v == "I") {
      xrf[0] = "I";
      xrf[1] = void 0;
      xrf[2] = void 0;
      xrf[3] = void 0;
      return [true, xrf, apps];
    } else {  // undefined variable
      return [false, xrf, apps];
    }
  }
};  // reduceVar
const reduceBool = (xrf, apps) => {  // xrf ["+b", bool, v0, v1]
  const [pb, b, v0, v1] = xrf;
  if (b) {  // true
    xrf[0] = "K";
    xrf[1] = 1;
    xrf[2] = void 0;
  } else {  // false
    xrf[0] = "Kx";
    xrf[1] = 1;
    xrf[2] = ["I", void 0, void 0, void 0];
  }
  xrf[3] = void 0;
  return ReduceOne(xrf, apps);
};
const reduceNum = (xrf, apps) => {  // xrf ["+n", num, v0, v1]
  const [pn, num, v0, v1] = xrf;
  // (s| s b0 b1 b2 b3 b4 b5 b6 b7)  unsigned 8 bit intenger
  // => C (C (C (C (C (C (C (C I b0) b1) b2) b3) b4) b5) b6) b7
  const i = ["I", void 0, void 0, void 0];
  const k = ["K", 1, void 0, void 0];
  const ki = ["Kx", 1, i, void 0];
  let x = i;      // to become XRF
  let n = num;  // integer
  for (let c = 0; c < 8; ++c) {
    x = ["Cxy", 1, x, ((n & 1) == 1) ? k : ki];
    n >>= 1;
  }
  xrf[0] = x[0];
  xrf[1] = x[1];
  xrf[2] = x[2];
  xrf[3] = x[3];
  return reduceOne(xrf, apps);
};  // reduceNum
const reduceStr = (xrf, apps) => {  // xrf ["+s", str, v0, v1]
  const [ps, str, v0, v1] = xrf;
  const u8a = new TextEncoder().encode(str);
  xrf[0] = "+a";  // JSON array
  xrf[1] = [...u8a];  // convert it into an array
  //xrf[2] = v0;
  //xrf[3] = v1;
  return reduceArray(xrf, apps);
};
const reduceArray = (xrf, apps) => {  // xrf ["+a", array, v0, v1]
  const [pa, ary, v0, v1] = xrf;
  //    [e0, e1, e2]
  // => (f|x| f e0; f|x| f e1; f|x| e2; f|x| x)
  // => B K (C (C I e0); B K; C (C I e1); B K; C (C I e2); K I)
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
  } else {
    xrf[0] = "Kx";
    xrf[1] = 1;
    xrf[2] = ["I", void 0, void 0, void 0];
    xrf[3] = void 0;
  }
  return reduceOne(xrf, apps);
};  // reduceArray
const reduceSxy = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [sxy, xn, xx, xy] = xrfX;
    if (xn >= 2) {
      xrf[0] = sxy;
      xrf[1] = xn - 1;
      xrf[2] = [app, xx, y, v1];
      xrf[3] = [app, xy, y, v1];
      return reduceSxy(xrf, apps);
    } else {  // xn == 1
      //xrf[0] = app;
      xrf[1] = [app, xx, y, v1];
      xrf[2] = [app, xy, y, v1];
      //xrf[3] = v1;
      apps.push(xrf);
      apps.push(xrf[1]);
      return [true, xx, apps];
    }
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};  // reduceSxy
const reduceSx = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [sx, xn, xx, xv1] = xrfX;
    xrf[0] = "Sxy";
    xrf[1] = xn;
    xrf[2] = xx;
    xrf[3] = y;
    return reduceSxy(xrf, apps);
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};
const reduceS = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [s, xn, xv1, xv2] = xrfX;
    xrf[0] = "Sx";
    xrf[1] = xn;
    //xrf[2] = y;
    //xrf[3] = v1;
    return reduceSx(xrf, apps);
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};
const reduceKx = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [kx, xn, xx, xv1] = xrfX;
    if (xn >= 2) {
      xrf[0] = kx;
      xrf[1] = xn - 1;
      xrf[2] = xx;
      //xrf[3] = v1;
      return reduceKx(xrf, apps);
    } else {  // xn == 1
      xrf[0] = xx[0];
      xrf[1] = xx[1];
      xrf[2] = xx[2];
      xrf[3] = xx[3];
      return [true, xrf, apps];
    }
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};  // reduceKx
const reduceK = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [k, xn, xv1, xv2] = xrfX;
    xrf[0] = "Kx";
    xrf[1] = xn;
    //xrf[2] = y;
    //xrf[3] = v1;
    return reduceKx(xrf, apps);
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};
const reduceCxy = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [cxy, xn, xx, xy] = xrfX;
    if (xn >= 2) {
      xrf[0] = cxy;
      xrf[1] = xn - 1;
      xrf[2] = [app, xx, y, v1];
      xrf[3] = xy;
      return reduceCxy(xrf, apps);
    } else {  // xn == 1
      //xrf[0] = app;
      xrf[1] = [app, xx, y, v1];
      xrf[2] = xy;
      //xrf[3] = v1;
      apps.push(xrf);
      apps.push(xrf[1]);
      return [true, xx, apps];
    }
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};
const reduceCx = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [cx, xn, xx, xv1] = xrfX;
    xrf[0] = "Cxy";
    xrf[1] = xn;
    xrf[2] = xx;
    xrf[3] = y;
    return reduceCxy(xrf, apps);
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};
const reduceC = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [c, xn, xv1, xv2] = xrfX;
    xrf[0] = "Cx";
    xrf[1] = xn;
    //xrf[2] = y;
    //xrf[3] = v1;
    return reduceCx(xrf, apps);
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};
const reduceBxy = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [bxy, xn, xx, xy] = xrfX;
    if (xn >= 2) {
      xrf[0] = bxy;
      xrf[1] = xn - 1;
      xrf[2] = xx;
      xrf[3] = [app, xy, y, v1];
      return reduceBxy(xrf, apps);
    } else {  // xn == 1
      //xrf[0] = app;
      xrf[1] = xx;
      xrf[2] = [app, xy, y, v1];
      //xrf[3] = v1;
      apps.push(xrf);
      return [true, xx, apps];
    }
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};
const reduceBx = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [bx, xn, xx, xv1] = xrfX;
    xrf[0] = "Bxy";
    xrf[1] = xn;
    xrf[2] = xx;
    xrf[3] = y;
    return reduceBxy(xrf, apps);
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};
const reduceB = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    const [b, xn, xv1, xv2] = xrfX;
    xrf[0] = "Bx";
    xrf[1] = xn;
    //xrf[2] = y;
    //xrf[3] = v1;
    return reduceBx(xrf, apps);
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};
const reduceI = (xrfX, apps) => {
  const xrf = apps.pop();
  if (xrf != void 0) {
    const [app, x, y, v1] = xrf;  // x == xrfX
    xrf[0] = y[0];
    xrf[1] = y[1];
    xrf[2] = y[2];
    xrf[3] = y[3];
    return [true, xrf, apps];
  } else {  // insufficient arguments
    return [false, xrfX, apps];
  }
};
const pushApp = (xrf, apps) => {  // xrf ["app", x, y, v0]
  apps.push(xrf);
  return reduceOne(xrf[1], apps);
};
const stopReduce = (xrf, apps) => [false, xrf, apps];
const reduceOne = (xrf, apps) => ({  // reduce one step
  "Sxy": reduceSxy,
  "Sx": reduceSx,
  "S": reduceS,
  "Kx": reduceKx,
  "K": reduceK,
  "Cxy": reduceCxy,
  "Cx": reduceCx,
  "C": reduceC,
  "Bxy": reduceBxy,
  "Bx": reduceBx,
  "B": reduceB,
  "I": reduceI,
  "app": pushApp,
  "var": reduceVar,    // variables
  "()": stopReduce,    // placeholder
  "+x": reduceCXP,     // source CXP
  "+n": reduceNum,     // JSON numbers
  "+s": reduceStr,     // JSON strings
  "+a": reduceStr,     // JSON arrays
  "-": stopReduce      // sentinel to output
}[xrf[0]] ?? ((x,a)=>{debugger;}))(xrf, apps);

const reduceXRF = (xrfOrg, external = false) => {
  let varFound = (xrfOrg[0] == "var");
  let [cont, xrf, apps] = reduceOne(xrfOrg, []);
  while (cont) {  // reduce loop
    // break at the variable in external code when in debug mode
    const debugMode = (nextCXP !== void 0);
    if (debugMode && external && xrf[0] == "var") {
      if (!varFound) {  // where it broke last time
        varFound = true;  // now proceed one step
      } else {  // next variable after last break
        nextCXP = xrfOrg;  // next time starts here
        break;
      }
    }
    [cont, xrf, apps] = reduceOne(xrf, apps);
  }
  if (external && !cont)
    nextCXP = void 0;  // end debug mode
  return [xrf, apps];
}

const reduceThenXRFtoCXP = (xrf) => {
  reduceXRF(xrf);  // internal for input
  return XRFtoCXP(xrf);
};
const XRFtoCXP = (xrf) => ({
  "Sxy": () => ["Sxy", xrf[1], XRFtoCXP(xrf[2]), XRFtoCXP(xrf[3])],
  "Sx": () => ["Sx", xrf[1], XRFtoCXP(xrf[2])],
  "S": () => ["S", xrf[1]],
  "Kx": () => ["Kx", xrf[1], XRFtoCXP(xrf[2])],
  "K": () => ["K", xrf[1]],
  "Cxy": () => ["Cxy", xrf[1], XRFtoCXP(xrf[2]), XRFtoCXP(xrf[3])],
  "Cx": () => ["Cx", xrf[1], XRFtoCXP(xrf[2])],
  "C": () => ["C", xrf[1]],
  "Bxy": () => ["Bxy", xrf[1], XRFtoCXP(xrf[2]), XRFtoCXP(xrf[3])],
  "Bx": () => ["Bx", xrf[1], XRFtoCXP(xrf[2])],
  "B": () => ["B", xrf[1]],
  "I": () => ["I"],
  "app": () => ["app", XRFtoCXP(xrf[1]), XRFtoCXP(xrf[2])],
  "var": () => ["var", xrf[1]],
  "()": () => ["()"],
  "+x": () => reduceThenXRFtoCXP(xrf),
  "+b": () => reduceThenXRFtoCXP(xrf),
  "+n": () => reduceThenXRFtoCXP(xrf),
  "+s": () => reduceThenXRFtoCXP(xrf),
  "+a": () => reduceThenXRFtoCXP(xrf)
}[xrf[0]])();
const cloneXRF = (xrf) => ({
  "Sxy": () => ["Sxy", xrf[1], cloneXRF(xrf[2]), cloneXRF(xrf[3])],
  "Sx": () => ["Sx", xrf[1], cloneXRF(xrf[2]), void 0],
  "S": () => ["S", xrf[1], void 0, void 0],
  "Kx": () => ["Kx", xrf[1], cloneXRF(xrf[2]), void 0],
  "K": () => ["K", xrf[1], void 0, void 0],
  "Cxy": () => ["Cxy", xrf[1], cloneXRF(xrf[2]), cloneXRF(xrf[3])],
  "Cx": () => ["Cx", xrf[1], cloneXRF(xrf[2]), void 0],
  "C": () => ["C", xrf[1], void 0, void 0],
  "Bxy": () => ["Bxy", xrf[1], cloneXRF(xrf[2]), cloneXRF(xrf[3])],
  "Bx": () => ["Bx", xrf[1], cloneXRF(xrf[2]), void 0],
  "B": () => ["B", xrf[1], void 0, void 0],
  "I": () => ["I", void 0, void 0, void 0],
  "app": () => ["app", cloneXRF(xrf[1]), cloneXRF(xrf[2]), void 0],
  "var": () => ["var", xrf[1], void 0, void 0],
  "()": () => ["()", void 0, void 0, void 0],
  "+x": ()=> ["+x", xrf[1], void 0, void 0],
  "+b": ()=> ["+b", xrf[1], void 0, void 0],
  "+n": ()=> ["+n", xrf[1], void 0, void 0],
  "+s": ()=> ["+s", xrf[1], void 0, void 0],
  "+a": ()=> ["+a", xrf[1], void 0, void 0],
  "-": ()=> ["-", xrf[1], xrf[2], xrf[3]]
}[xrf[0]])();
const XRFtoJSON = (xrf0) => {  // convert XRF to JSON (or returns void 0)
  // recognize output by placing a sentinel
  const xrf1 = [  // clone CXP so that it does not affect to the original XRF
    "app", cloneXRF(xrf0), [
      "-", 0, void 0, void 0    // sentinel#0 to output
    ], void 0
  ];
  let [[sentl, sentlData], apps] = reduceXRF(xrf1);  // internal for output

  // first check whether it is a number such as:
  //   (s| s K (K I) (K I) (K I) (K I) (K I) K (K I))
  //   => 65 = 0x41 = 0b01000001 = 'A'
  if (sentl == "-" && apps.length == 8) {
    // it may be a number
    let u8 = 0;  // unsigned 8 bits integer
    let bc = 0;
    for (let c = xrf1; c[0] == "app"; c = c[1], ++bc) {
      const [[sl, sld], ap] = reduceXRF([  // internal for output
        "app", [
          "app",
          cloneXRF(c[2]),
          ["-", 1, void 0, void 0],  // sentinel to output 1
          void 0
        ],
        ["-", 0, void 0, void 0],  // sentinel to output 0
        void 0
      ]);
      if (sl === "-" && ap.length == 0) {
        u8 = (u8 << 1) | sld;  // bitwise shift and or
      } else {
        u8 = void 0;  // it was not a number
        break;
      }
    }
    if (u8 !== void 0 && bc == 8) {
      return u8;  // it was a number
    }
  }

  // give another sentinel to check boolean or array
  const xrf2 = [
    "app", xrf1, [
      "-", 1, void 0, void 0  // sentinel#1 to output
    ], void 0
  ];
  [[sentl, sentlData], apps] = reduceXRF(xrf2);  // internal for output

  if (sentl == "-") {
    if (apps.length == 0) {  // boolean or an end of array (f|x| x)
      return (sentlData  == 0);  // 0: true, 1: false
    } else {
      const [app, x, y] = xrf2;
      const [appX, xx, xy] = x;
      if (apps.length == 2 && app == "app" && appX == "app" && sentlData == 0) {  // f|x| f data subArray
        const data = AryToStr(XRFtoJSON(xy));
        if (data !== void 0) {
          const subAr = XRFtoJSON(y);
          if (toString.call(subAr) == "[object Array]") {
            return [data].concat(subAr);
          } else if (typeof subAr == "boolean" && !subAr) {
            return [data];
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
                "app", xrf2, [ // sentinel#0 and #1
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
  ];  // xrf3
  [[sentl, sentlData], apps] = reduceXRF(xrf3);  // internal for output
  if (sentl == "-") {
    const ret = [
      () => {  // 0: lam v x vf (lambda)
        const [app, x, y] = xrf3;
        const [appX, xx, xy] = x;
        const [appXX, xxx, xxy] = xx;
        if (apps.length == 3 && app == "app" && appX == "app" && appXX == "app") {
          const lcxV = AryToStr(XRFtoJSON(xxy));  // variable name
          const lcxX = XRFtoJSON(xy);  // expression
          const lcxVF = XRFtoJSON(y);  // array of string
          if (lcxV != void 0 && lcxX != void 0 && lcxVF != void 0)
            return ["LCX:lam", lcxV, lcxX, lcxVF];
        }
        return void 0;
      },
      () => {  // 1: app x y vf (application)
        const [app, x, y] = xrf3;
        const [appX, xx, xy] = x;
        const [appXX, xxx, xxy] = xx;
        if (apps.length == 3 && app == "app" && appX == "app" && appXX == "app") {
          const lcxX = XRFtoJSON(xxy);  // expression x
          const lcxY = XRFtoJSON(xy);  // expression y
          const lcxVF = XRFtoJSON(y);  // array of string
          if (lcxX != void 0 && lcxY != void 0 && lcxVF != void 0)
            return ["LCX:app", lcxX, lcxY, lcxVF];
        }
        return void 0;
      },
      () => {  // 2: var v (variable)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxV = toStr(XRFtoJSON(y));  // variable name
          if (lcxV != void 0)
            return ["LCX:var", lcxV];
        }
        return void 0;
      },
      () => {  // 3: ph (placeholder)
        if (apps.length == 0) {
          return ["LCX:()"];
        }
        return void 0;
      },
      () => {  // 4: s n (Sn combinator)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxN = XRFtoJSON(y);  // n
          if (lcxN != void 0)
            return ["LCX:S", lcxN];
        }
        return void 0;
      },
      () => {  // 5: k n (Kn combinator)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxN = XRFtoJSON(y);  // n
          if (lcxN != void 0)
            return ["LCX:K", lcxN];
        }
        return void 0;
      },
      () => {  // 6: c n (Cn combinator)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxN = XRFtoJSON(y);  // n
          if (lcxN != void 0)
            return ["LCX:C", lcxN];
        }
        return void 0;
      },
      () => {  // 7: b n (Bn combinator)
        const [app, x, y] = xrf3;
        if (apps.length == 1 && app == "app") {
          const lcxN = XRFtoJSON(y);  // n
          if (lcxN != void 0)
            return ["LCX:B", lcxN];
        }
        return void 0;
      },
      () => {  // 8: i (I combinator)
        if (apps.length == 0) {
          return ["LCX:I"];
        }
        return void 0;
      }
    ][sentlData]();
    if (ret != void 0)
      return ret;
  }
  return void 0;
};

const AryToStr = (json) => {
  if (outputStr && toString.call(json) == "[object Array]" &&
      json.reduce((a, e) => a && typeof e == "number", true)) {
    const u8a = new Uint8Array(json);
    return (new TextDecoder()).decode(u8a);  // UTF-8
  } else {
    return json;
  }
}
const NtoStr = (n) => (n == 1) ? "" : "" + n;
const CXPtoStr = (cxp) => ({
  "Sxy": () => "(S" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + " " + CXPtoStr(cxp[3]) + ")",
  "Sx": () => "(S" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  "S": () => "S" + NtoStr(cxp[1]),
  "Kx": () => "(K" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  "K": () => "K" + NtoStr(cxp[1]),
  "Cxy": () => "(C" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + " " + CXPtoStr(cxp[3]) + ")",
  "Cx": () => "(C" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  "C": () => "C" + NtoStr(cxp[1]),
  "Bxy": () => "(B" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + " " + CXPtoStr(cxp[3]) + ")",
  "Bx": () => "(B" + NtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  "B": () => "B" + NtoStr(cxp[1]),
  "I": () => "I",
  "app": () => "(" + CXPtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  "var": () => cxp[1],
  "()": () => "()"
}[cxp[0]])();
const XRFtoComb = (xrf) => {  // stringify XRF in combinator form
  if (outputComb) {
    return CXPtoStr(XRFtoCXP(xrf));
  } else {
    return XRFtoCXP(xrf);
  }
};
const XRFtoStr = (xrf) => {  // stringify XRF in JSON
  if (outputJSON) {
    const json = AryToStr(XRFtoJSON(xrf));
    if (json !== void 0)
      return json;
  }
  return XRFtoComb(xrf);
};

const nodeToText = (nd) => {
  switch (nd.nodeName.toLowerCase()) {
    case "#text":
      return nd.nodeValue;
    case "div":  // new line
    case "p":
    case "br":
      return "\n" + nodesToText(nd.childNodes);
    default:
      if (nd.childNodes != null ) {
        return nodesToText(nd.childNodes);
      } else {
        return "";
      }
  }
};
const nodesToText = (ns) => {
  let t = "";
  ns.forEach(nd => {
    t += nodeToText(nd);
  });
  return t;
};

const pastePlainText = (e) => {
  let text = e.clipboardData.getData("text/plain");
  const selection = window.getSelection();
  selection.deleteFromDocument();
  const range = selection.getRangeAt(0);
  let nodeIns = range.startContainer;  // node to insert text
  let offsetIns = range.startOffset;  // offset to insert text in case of text node
  let textRemain = void 0;
  while (text.length > 0) {
    const line = (text.match(/^[^\r\n]+/) ?? [""])[0];
    if (line.length > 0) {
      if (nodeIns.nodeType == Node.TEXT_NODE) {
        const nodeText = nodeIns.textContent;
        if (textRemain === void 0)
          textRemain = nodeText.slice(offsetIns);
        const newText = nodeText.slice(0, offsetIns).concat(line);
        nodeIns.textContent = newText;
        offsetIns = newText.length;
      } else {
        const newNode = document.createTextNode(line);
        if (nodeIns.nodeName.toLowerCase() == "pre")
          nodeIns.appendChild(newNode);
        else
          nodeIns.parentNode.insertBefore(newNode, nodeIns.nextSibling);
        nodeIns = newNode;
        offsetIns = line.length;
        if (textRemain === void 0)
          textRemain = "";
      }
      text = text.slice(line.length);
    }
    const cr = (text.match(/^(\r\n|\n|\r)/) ?? [""])[0];
    if (cr.length > 0) {
      const newNode = document.createElement("br");
      nodeIns.parentNode.insertBefore(newNode, nodeIns.nextSibling);
      nodeIns = newNode;
      if (textRemain === void 0)
          textRemain = "";
      text = text.slice(cr.length);
    }
  }
  if (textRemain !== void 0 && textRemain.length > 0) {
    if (nodeIns.nodeType == Node.TEXT_NODE) {
      const nodeText = nodeIns.textContent;
      const newText = nodeText.slice(0, offsetIns).concat(textRemain);
      nodeIns.textContent = newText;
      offsetIns = newText.length;
    } else {
      const newNode = document.createTextNode(textRemain);
      nodeIns.parentNode.insertBefore(newNode, nodeIns.nextSibling);
      nodeIns = newNode;
      offsetIns = textRemain.length;
    }
  }
  selection.setPosition(nodeIns, offsetIns);
  e.preventDefault();
};

document.addEventListener("DOMContentLoaded", () => {
  const elemCode = document.getElementById("code");
  elemCode.textContent = "";  //"         1         2         3         4         5         6\n123456789012345678901234567890123456789012345678901234567890";
  elemCode.addEventListener("paste", pastePlainText);
  const elemInput = document.getElementById("input");
  elemInput.textContent = "";
  elemInput.addEventListener("paste", pastePlainText);
  const elemInput2 = document.getElementById("input2");
  elemInput.textContent = "";
  elemInput.addEventListener("paste", pastePlainText);
  const elemOutput = document.getElementById("output");
  const elemJSON = document.getElementById('outputJSON');
  const elemCXP = document.getElementById('StringfyCXP');
  const elemStr = document.getElementById('outputStr');
  const elemC = document.getElementById('LXP');
  const elemNext = document.getElementById('reduceNext');
  const elemReset = document.getElementById('reduceReset');
  const elemCopy = document.getElementById('copyToClipboard');

  
  const LXPStrToExpr = (lxp) => ({
    "lam": () => [  // B K3 (C (C I v) x)
      "Bxy", 1, [
        "K", 3, void 0, void 0
      ], [
        "Cxy", 1, [
          "Cxy", 1, [
            "I", void 0, void 0, void 0
          ], [
            "+", lxp[1], void 0, void 0    // v
          ]
        ], LXPStrToExpr(lxp[2])  // x
      ]
    ],
    "app": () => [  // K (B K2; C (C I x) y)
      "Kx", 1, [
        "Bxy", 1, [
          "K", 2, void 0, void 0
        ], [
          "Cxy", 1, [
            "Cxy", 1, [
              "I", void 0, void 0, void 0
            ], LXPStrToExpr(lxp[1])  // x
          ], LXPStrToExpr(lxp[2])  // y
        ]
      ], void 0
    ],
    "var": () => [  // K2 (B K; C I v)
      "Kx", 2, [
        "Bxy", 1, [
          "K", 1, void 0, void 0
        ], [
          "Cxy", 1, ["I"], ["+", lxp[1]]  // v
        ]
      ], void 0
    ],
    "()": () => ["Kx", 3, ["I"]]       // K3 I
  })[lxp[0]]();
  
  
  const updateOutput = (debug = false) => {
    let data;
    const code = nodesToText(elemCode.childNodes);
    const inputElem = nodesToText(elemInput.childNodes);
 
    if (!debug || nextCXP === void 0) {
      const input2Elem = nodesToText(elemInput2.childNodes);
      let input, input2;
      try {
        data = ["+", JSON.parse(code)];
      } catch {
        try {
          data = LXPtoCXP(pegToLXP(parse(code)));
        } catch {
          data = void 0; // ignore input errors
        }
      }
      try {
        input = ["+", JSON.parse(inputElem)];
      } catch {
        try {
          if (forceLXP) {
            input = LXPStrToExpr(pegToLXP(parse(inputElem)));
          } else 
            input = LXPtoCXP(pegToLXP(parse(inputElem)));
          if (input[0] == "()")
            input = void 0;
        } catch {
          input = void 0; // ignore input errors
        }
      }
      try {
        input2 = ["+", JSON.parse(input2Elem)];
      } catch {
        try {
          input2 = LXPtoCXP(pegToLXP(parse(input2Elem)));
          if (input2[0] == "()")
            input2 = void 0;
        } catch {
          input2 = void 0; // ignore input errors
        }
      }
      if (data !== void 0) {
        //try {
          const xrf = (!(!input) || input === false) ? (  // xrf to reduce
            (!(!input2) || input2 === false) ? [
              "app", [
                "app",
                CXPtoXRF(data),
                CXPtoXRF(input),
                void 0
              ],
              CXPtoXRF(input2),
              void 0
            ] : [
              "app",
              CXPtoXRF(data),
              CXPtoXRF(input),
              void 0
            ]
          ) : CXPtoXRF(data);  // no input if input is not given
          if (debug) {
            nextCXP = xrf;  // enter debug mode
            data = XRFtoComb(xrf);
          } else {
            reduceXRF(xrf, true);  // reduce external code (subject to debugging)
            data = XRFtoStr(xrf);
          }
        //} catch {
        //  data = void 0;
        //  nextCXP = void 0;
        //}
      }
    } else {  // nextCXP !== void 0
      //try {
        const xrf = nextCXP;
        reduceXRF(xrf, true);  // reduce external code (subject to debugging)
        if (nextCXP !== void 0) {  // middle of debugging
          data = XRFtoComb(xrf);
        } else {  // finished debugging
          data = XRFtoStr(xrf);
        }
      //} catch {
      //  data = void 0;
      //  nextCXP = void 0;
      //}
    }
    if (data === void 0) {
      data = "(no output)";
    } else if (typeof data !== "string") {
      if (compact) {
        data = JSON.stringify(data);
      } else {
        data = JSON.stringify(data, null, 2);
      }
    }
    elemOutput.textContent = data;
    elemReset.disabled = (nextCXP === void 0);
    elemNext.textContent = (nextCXP === void 0) ? "Debug" : "Next";
  };  // updateOutput

  const obCode = new MutationObserver(mr => {
    nextCXP = void 0;  // end debug mode
    updateOutput();
  });
  obCode.observe(elemCode, {
    childList: true,      // to observe the ENTER key
    characterData: true,  // and the other characters
    subtree: true
  });
  const obInput = new MutationObserver(mr => {
    nextCXP = void 0;  // end debug mode
    updateOutput();
  });
  obInput.observe(elemInput, {
    childList: true,      // to observe the ENTER key
    characterData: true,  // and the other characters
    subtree: true
  });
  const obInput2 = new MutationObserver(mr => {
    nextCXP = void 0;  // end debug mode
    updateOutput();
  });
  obInput2.observe(elemInput2, {
    childList: true,      // to observe the ENTER key
    characterData: true,  // and the other characters
    subtree: true
  });

  elemJSON.disabled = false;
  elemJSON.checked = outputJSON;
  elemJSON.addEventListener('click', () => {
    outputJSON = elemJSON.checked;
    updateOutput();
  });

  elemCXP.disabled = false;
  elemCXP.checked = outputComb;
  elemCXP.addEventListener('click', () => {
    outputComb = elemCXP.checked;
    updateOutput();
  });

  elemStr.disabled = false;
  elemStr.checked = outputStr;
  elemStr.addEventListener('click', () => {
    outputStr = elemStr.checked;
    updateOutput();
  });
  elemC.disabled = false;
  elemC.checked = forceLXP;
  elemC.addEventListener('click', () => {
    forceLXP = elemC.checked;
    updateOutput();
  });

  elemNext.addEventListener('click', () => {
    updateOutput(true);  // debug mode
  });
  elemReset.addEventListener('click', () => {
    nextCXP = void 0;  // end debug mode
    updateOutput();
  });
  elemCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(elemOutput.textContent);
  });
  updateOutput();
});