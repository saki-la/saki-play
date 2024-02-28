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
  ["app", exprX, exprY]
  ["var", "varName"]  // free varialble
  ["()"]  // placeholder
  ["+", cval]  // internal: sentinel to input
  ["-", cval]  // internal: sentinel to output

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

const cloneCXP = (cxp) => ({
  "Sxy": () => ["Sxy", cxp[1], cloneCXP(cxp[2]), cloneCXP(cxp[3])].concat(cxp.slice(4)),
  "Sx": () => ["Sx", cxp[1], cloneCXP(cxp[2]), void 0].concat(cxp.slice(3)),
  "S": () => ["S", cxp[1], void 0, void 0].concat(cxp.slice(2)),
  "Kx": () => ["Kx", cxp[1], cloneCXP(cxp[2]), void 0].concat(cxp.slice(3)),
  "K": () => ["K", cxp[1], void 0, void 0].concat(cxp.slice(2)),
  "Cxy": () => ["Cxy", cxp[1], cloneCXP(cxp[2]), cloneCXP(cxp[3])].concat(cxp.slice(4)),
  "Cx": () => ["Cx", cxp[1], cloneCXP(cxp[2]), void 0].concat(cxp.slice(3)),
  "C": () => ["C", cxp[1], void 0, void 0].concat(cxp.slice(2)),
  "Bxy": () => ["Bxy", cxp[1], cloneCXP(cxp[2]), cloneCXP(cxp[3])].concat(cxp.slice(4)),
  "Bx": () => ["Bx", cxp[1], cloneCXP(cxp[2]), void 0].concat(cxp.slice(3)),
  "B": () => ["B", cxp[1], void 0, void 0].concat(cxp.slice(2)),
  "I": () => ["I", void 0, void 0, void 0].concat(cxp.slice(1)),
  "app": () => ["app", cloneCXP(cxp[1]), cloneCXP(cxp[2]), void 0].concat(cxp.slice(3)),
  "var": () => ["var", cxp[1], void 0, void 0].concat(cxp.slice(2)),
  "()": () => ["()", void 0, void 0, void 0].concat(cxp.slice(1)),
  "+": ()=> ["+", cxp[1], void 0, void 0].concat(cxp.slice(2))
}[cxp[0]])();
const removeVoid = (cxp) => ({
  "Sxy": () => ["Sxy", cxp[1], removeVoid(cxp[2]), removeVoid(cxp[3])].concat(cxp.slice(4)),
  "Sx": () => ["Sx", cxp[1], removeVoid(cxp[2])].concat(cxp.slice(4)),
  "S": () => ["S", cxp[1]].concat(cxp.slice(4)),
  "Kx": () => ["Kx", cxp[1], removeVoid(cxp[2])].concat(cxp.slice(4)),
  "K": () => ["K", cxp[1]].concat(cxp.slice(4)),
  "Cxy": () => ["Cxy", cxp[1], removeVoid(cxp[2]), removeVoid(cxp[3])].concat(cxp.slice(4)),
  "Cx": () => ["Cx", cxp[1], removeVoid(cxp[2])].concat(cxp.slice(4)),
  "C": () => ["C", cxp[1]].concat(cxp.slice(4)),
  "Bxy": () => ["Bxy", cxp[1], removeVoid(cxp[2]), removeVoid(cxp[3])].concat(cxp.slice(4)),
  "Bx": () => ["Bx", cxp[1], removeVoid(cxp[2])].concat(cxp.slice(4)),
  "B": () => ["B", cxp[1]].concat(cxp.slice(4)),
  "I": () => ["I"].concat(cxp.slice(4)),
  "app": () => ["app", removeVoid(cxp[1]), removeVoid(cxp[2])].concat(cxp.slice(4)),
  "var": () => ["var", cxp[1]].concat(cxp.slice(4)),
  "()": () => ["()"].concat(cxp.slice(4)),
  "+": () => {  // sentinel to input
    reduceCXP(cxp);  // internal for input
    return removeVoid(cxp);
  }
}[cxp[0]])();
const NToStr = (n) => (n == 1) ? "" : "" + n;
const CXPtoStr = (cxp) => ({
  "Sxy": () => "(S" + NToStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + " " + CXPtoStr(cxp[3]) + ")",
  "Sx": () => "(S" + NToStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  "S": () => "S" + NToStr(cxp[1]),
  "Kx": () => "(K" + NToStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  "K": () => "K" + NToStr(cxp[1]),
  "Cxy": () => "(C" + NToStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + " " + CXPtoStr(cxp[3]) + ")",
  "Cx": () => "(C" + NToStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  "C": () => "C" + NToStr(cxp[1]),
  "Bxy": () => "(B" + NToStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + " " + CXPtoStr(cxp[3]) + ")",
  "Bx": () => "(B" + NToStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  "B": () => "B" + NToStr(cxp[1]),
  "I": () => "I",
  "app": () => "(" + CXPtoStr(cxp[1]) + " " + CXPtoStr(cxp[2]) + ")",
  "var": () => cxp[1],
  "()": () => "()"
}[cxp[0]])();
 
const pushApp = (cxp, apps) => {  // cxp ["app", x, y, v0]
  apps.push(cxp);
  return [true, cxp[1], apps];
};
const reduceApp = (cxp, apps) => {
  const [app, x, y, v0] = cxp;
  return ({
    "Sxy": () => {  // cxp ["app", x ["Sxy", n, xx, xy], y, v0]
      // distribute y to both xx and xy
      const [sxy, n, xx, xy] = x;
      if (n >= 2) {
        cxp[0] = sxy;
        cxp[1] = n - 1;
        cxp[2] = [app, xx, y, v0];
        cxp[3] = [app, xy, y, v0];
      } else {  // n == 1
        //cxp[0] = app;
        cxp[1] = [app, xx, y, v0];
        cxp[2] = [app, xy, y, v0];
        //cxp[3] = v0;
      }
      return [true, cxp, apps];
    },
    "Sx": () => {  // cxp ["app", x ["Sx", n, xx, v1], y, v0]
      const [sx, n, xx, v1] = x;
      cxp[0] = "Sxy";
      cxp[1] = n;
      cxp[2] = xx;
      cxp[3] = y;
      return [true, cxp, apps];
    },
    "S": () => {  // cxp ["app", x ["S", n, v1, v2], y, v0]
      const [s, n, v1, v2] = x;
      cxp[0] = "Sx";
      cxp[1] = n;
      cxp[2] = y;
      //cxp[3] = v0;
      return [true, cxp, apps];
    },
    "Cxy": () => {  // cxp ["app", x ["Cxy", n, xx, xy], y, v0]
      // distribute y to xx only
      const [cxy, n, xx, xy] = x;
      if (n >= 2) {
        cxp[0] = cxy;
        cxp[1] = n - 1;
        cxp[2] = [app, xx, y, v0];
        cxp[3] = xy;
      } else {  // n == 1
        //cxp[0] = app;
        cxp[1] = [app, xx, y, v0];
        cxp[2] = xy;
        //cxp[3] = v0;
      }
      return [true, cxp, apps];
    },
    "Cx": () => {  // cxp ["app", x ["Cx", n, xx, v1], y, v0]
      const [cx, n, xx, v1] = x;
      cxp[0] = "Cxy";
      cxp[1] = n;
      cxp[2] = xx;
      cxp[3] = y;
      return [true, cxp, apps];
    },
    "C": () => {  // cxp ["app", x ["C", n, v1, v2], y, v0]
      const [c, n, v1, v2] = x;
      cxp[0] = "Cx";
      cxp[1] = n;
      cxp[2] = y;
      //cxp[3] = v0;
      return [true, cxp, apps];
    },
    "Bxy": () => {  // cxp ["app", x ["Bxy", n, xx, xy], y, v0]
      // distribute y to xy only
      const [bxy, n, xx, xy] = x;
      if (n >= 2) {
        cxp[0] = bxy;
        cxp[1] = n - 1;
        cxp[2] = xx;
        cxp[3] = [app, xy, y, v0];
      } else {  // n == 1
        //cxp[0] = app;
        cxp[1] = xx;
        cxp[2] = [app, xy, y, v0];
        //cxp[3] = v0;
      }
      return [true, cxp, apps];
    },
    "Bx": () => {  // cxp ["app", x ["Bx", n, xx, v1], y, v0]
      const [bx, n, xx, v1] = x;
      cxp[0] = "Bxy";
      cxp[1] = n;
      cxp[2] = xx;
      cxp[3] = y;
      return [true, cxp, apps];
    },
    "B": () => {  // cxp ["app", x ["B", n, v1, v2], y, v0]
      const [s, n, v1, v2] = x;
      cxp[0] = "Bx";
      cxp[1] = n;
      cxp[2] = y;
      //cxp[3] = v0;
      return [true, cxp, apps];
    },
    "Kx": () => {  // cxp ["app", x ["Kx", n, xx, v1], y, v0]
      // remove y
      const [kx, n, xx, v1] = x;
      if (n >= 2) {
        cxp[0] = kx;
        cxp[1] = n - 1;
        cxp[2] = xx;
        //cxp[3] = v0;
      } else {  // n == 1
        cxp[0] = xx[0];
        cxp[1] = xx[1];
        cxp[2] = xx[2];
        cxp[3] = xx[3];
      }
      return [true, cxp, apps];
    },
    "K": () => {  // cxp ["app", x ["K", n, v1, v2], y, v0]
      const [k, n, v1, v2] = x;
      cxp[0] = "Kx";
      cxp[1] = n;
      cxp[2] = y;
      //cxp[3] = v0;
      return [true, cxp, apps];
    },
    "I": () => {  // cxp ["app", x ["I", v1, v2, v3], y, v0]
      cxp[0] = y[0];
      cxp[1] = y[1];
      cxp[2] = y[2];
      cxp[3] = y[3];
      return [true, cxp, apps];
    },
    "app": () => pushApp(cxp, apps),
    "var": () => pushApp(cxp, apps),
    "()": () => pushApp(cxp, apps),
    "+": () => pushApp(cxp, apps),
    "-": () => pushApp(cxp, apps)
  }[x[0]])();
};  // reduceApp
const reduceVar = (cxp, apps) => {  // cxp ["var", v, v0, v1]
  const v = cxp[1];
  const fn = library[v];
  if (fn !== void 0) {
    const newCXP = cloneCXP(fn);
    cxp[0] = newCXP[0];
    cxp[1] = newCXP[1];
    cxp[2] = newCXP[2];
    cxp[3] = newCXP[3];
    return [true, cxp, apps];
  } else {
    const comb = (v.match(/^[SKCB]/) ?? [null])[0];
    const n = (v.slice(1).match(/^[0-9]+/) ?? [null])[0];
    if (comb) {
      cxp[0] = comb;
      cxp[1] = n ? +n : 1;
      cxp[2] = void 0;
      cxp[3] = void 0;
      return [true, cxp, apps];
    } else if (v == "I") {
      cxp[0] = "I";
      cxp[1] = void 0;
      cxp[2] = void 0;
      cxp[3] = void 0;
      return [true, cxp, apps];
    } else {
      return [false, cxp, apps];  // undefined variable
    }
  }
};
const reduceInput = (cxp, apps) => {  // cxp ["+", input, v0, v1]
  const [plus, input, v0, v1] = cxp;
  return ({
    "boolean": () => {
      if (input) {  // true
        cxp[0] = "K";
        cxp[1] = 1;
        cxp[2] = void 0;
      } else {  // false
        cxp[0] = "Kx";
        cxp[1] = 1;
        cxp[2] = ["I", void 0, void 0, void 0];
      }
      cxp[3] = void 0;
      return [true, cxp, apps];
    },
    "number": () => {
      // (s| s b0 b1 b2 b3 b4 b5 b6 b7)  unsigned 8 bit intenger
      // => C (C (C (C (C (C (C (C I b0) b1) b2) b3) b4) b5) b6) b7
      const i = ["I", void 0, void 0, void 0];
      const k = ["K", 1, void 0, void 0];
      const ki = ["Kx", 1, i, void 0];
      let x = i;      // to become CXP
      let n = input;  // integer
      for (let c = 0; c < 8; ++c) {
        x = ["Cxy", 1, x, ((n & 1) == 1) ? k : ki];
        n >>= 1;
      }
      cxp[0] = x[0];
      cxp[1] = x[1];
      cxp[2] = x[2];
      cxp[3] = x[3];
      return [true, cxp, apps];
    },
    "string": () => {
      const u8a = new TextEncoder().encode(input);
      //cxp[0] = plus;
      cxp[1] = [...u8a];  // convert it into an array
      //cxp[2] = v0;
      //cxp[3] = v1;
      return [true, cxp, apps];
    },
    "object": () => ({
      "[object Array]": () => {
        //    [e0, e1, e2]
        // => (f|x| f e0; f|x| f e1; f|x| e2; f|x| x)
        // => B K (C (C I e0); B K; C (C I e1); B K; C (C I e2); K I)
        if (input.length > 0) {
          const [e0, ...rest] = input;
          cxp[0] = "Bxy";
          cxp[1] = 1;
          cxp[2] = ["K", 1, void 0, void 0];
          cxp[3] = [
            "Cxy", 1, [
              "Cxy", 1, [
                "I", void 0, void 0, void 0
              ], [
                "+", e0, void 0, void 0
              ]
            ], [
              "+", rest, void 0, void 0
            ]
          ];
        } else {
          cxp[0] = "Kx";
          cxp[1] = 1;
          cxp[2] = ["I", void 0, void 0, void 0];
          cxp[3] = void 0;
        }
        return [true, cxp, apps];
      }
    }[toString.call(input)] ?? (() => [false, cxp, apps]))()
  }[typeof input] ?? (() => [false, cxp, apps]))();
};
const popApp = (cxp, apps) => {
  const newCXP = apps.pop();
  if (newCXP !== void 0) {
    if (newCXP[0] != "app" || newCXP[1] !== cxp)
      throw new Error("inconsistent cxp at ReduceOne")
    return reduceApp(newCXP, apps);
  } else {
    return [false, cxp, apps];  // insufficient arguments
  }
};
const breakReduce = (cxp, apps) => [false, cxp, apps];
const reduceOne = (cxp, apps) => ({  // reduce one step
  "Sxy": popApp,
  "Sx": popApp,
  "S": popApp,
  "Kx": popApp,
  "K": popApp,
  "Cxy": popApp,
  "Cx": popApp,
  "C": popApp,
  "Bxy": popApp,
  "Bx": popApp,
  "B": popApp,
  "I": popApp,
  "app": reduceApp,
  "var": reduceVar,
  "()": breakReduce,  // reduce on placeholder
  "+": reduceInput,
  "-": breakReduce  // sentinel to output
}[cxp[0]] ?? breakReduce)(cxp, apps);

const reduceCXP = (cxpOrg, external = false) => {
  let varFound = (cxpOrg[0] == "var");
  let [cont, cxp, apps] = reduceOne(cxpOrg, []);
  while (cont) {  // reduce loop
    // break at the variable in external code when in debug mode
    const debugMode = (nextCXP !== void 0);
    if (debugMode && external && cxp[0] == "var") {
      if (!varFound) {  // where it broke last time
        varFound = true;  // now proceed one step
      } else {  // next variable after last break
        nextCXP = cxpOrg;  // next time starts here
        break;
      }
    }
    [cont, cxp, apps] = reduceOne(cxp, apps);
  }
  if (external && !cont)
    nextCXP = void 0;  // end debug mode
  return [cxp, apps];
}

const CXPtoJSON = (cxpOrg) => {  // convert CXP to JSON (or returns void 0)
  // recognize output by placing a sentinel
  let cxp = [  // clone CXP so that it does not affect to the original CXP
    "app", cloneCXP(cxpOrg), [
      "-", 0, void 0, void 0    // sentinel#0 to output
    ], void 0
  ];
  let [[sentl, sentlData], apps] = reduceCXP(cxp);  // internal for output

  // first check whether it is a number such as:
  //   (s| s K (K I) (K I) (K I) (K I) (K I) K (K I))
  //   => 65 = 0x41 = 0b01000001 = 'A'
  if (sentl == "-" && apps.length == 8) {
    // it may be a number
    let u8 = 0;  // unsigned 8 bits integer
    let bc = 0;
    for (let c = cxp; c[0] == "app"; c = c[1], ++bc) {
      const [[sl, sld], ap] = reduceCXP([  // internal for output
        
        "app", [
          "app",
          cloneCXP(c[2]),
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
  cxp = [
    "app", cxp, [
      "-", 1, void 0, void 0  // sentinel#1 to output
    ], void 0
  ];
  [[sentl, sentlData], apps] = reduceCXP(cxp);  // internal for output

  if (sentl == "-") {
    if (apps.length == 0) {  // boolean or an end of array (f|x| x)
      return (sentlData  == 0);  // 0: true, 1: false
    } else {
      const [app, x, y] = cxp;
      const [appX, xx, xy] = x;
      if (apps.length == 2 && app == "app" && appX == "app" && sentlData == 0) {  // f|x| f data subArray
        const data = toStr(CXPtoJSON(xy));
        if (data !== void 0) {
          const subAr = CXPtoJSON(y);
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
  //   cxp lam app var ph s k c b i
  cxp = [
    "app", [
      "app", [
        "app", [
          "app", [
            "app", [
              "app", [
                "app", cxp, [ // sentinel#0 and #1
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
  ];  // cxp
  [[sentl, sentlData], apps] = reduceCXP(cxp);  // internal for output
  if (sentl == "-") {
    const ret = [
      () => {  // 0: lam v x vf (lambda)
        const [app, x, y] = cxp;
        const [appX, xx, xy] = x;
        const [appXX, xxx, xxy] = xx;
        if (apps.length == 3 && app == "app" && appX == "app" && appXX == "app") {
          const lcxV = toStr(CXPtoJSON(xxy));  // variable name
          const lcxX = CXPtoJSON(xy);  // expression
          const lcxVF = CXPtoJSON(y);  // array of string
          if (lcxV != void 0 && lcxX != void 0 && lcxVF != void 0)
            return ["LCX:lam", lcxV, lcxX, lcxVF];
        }
        return void 0;
      },
      () => {  // 1: app x y vf (application)
        const [app, x, y] = cxp;
        const [appX, xx, xy] = x;
        const [appXX, xxx, xxy] = xx;
        if (apps.length == 3 && app == "app" && appX == "app" && appXX == "app") {
          const lcxX = CXPtoJSON(xxy);  // expression x
          const lcxY = CXPtoJSON(xy);  // expression y
          const lcxVF = CXPtoJSON(y);  // array of string
          if (lcxX != void 0 && lcxY != void 0 && lcxVF != void 0)
            return ["LCX:app", lcxX, lcxY, lcxVF];
        }
        return void 0;
      },
      () => {  // 2: var v (variable)
        const [app, x, y] = cxp;
        if (apps.length == 1 && app == "app") {
          const lcxV = toStr(CXPtoJSON(y));  // variable name
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
        const [app, x, y] = cxp;
        if (apps.length == 1 && app == "app") {
          const lcxN = CXPtoJSON(y);  // n
          if (lcxN != void 0)
            return ["LCX:S", lcxN];
        }
        return void 0;
      },
      () => {  // 5: k n (Kn combinator)
        const [app, x, y] = cxp;
        if (apps.length == 1 && app == "app") {
          const lcxN = CXPtoJSON(y);  // n
          if (lcxN != void 0)
            return ["LCX:K", lcxN];
        }
        return void 0;
      },
      () => {  // 6: c n (Cn combinator)
        const [app, x, y] = cxp;
        if (apps.length == 1 && app == "app") {
          const lcxN = CXPtoJSON(y);  // n
          if (lcxN != void 0)
            return ["LCX:C", lcxN];
        }
        return void 0;
      },
      () => {  // 7: b n (Bn combinator)
        const [app, x, y] = cxp;
        if (apps.length == 1 && app == "app") {
          const lcxN = CXPtoJSON(y);  // n
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




const toStr = (json) => {
  if (outputStr && toString.call(json) == "[object Array]" &&

      json.reduce((a, e) => a && typeof e == "number", true)) {
    const u8a = new Uint8Array(json);
    return (new TextDecoder()).decode(u8a);  // UTF-8
  } else {
    return json;
  }
}

const stringifyComb = (cxp) => {  // stringify CXP in combinator form
  if (outputComb) {
    return CXPtoStr(removeVoid(cxp));
  } else {
    return removeVoid(cxp);
  }
};

const stringifyJSON = (cxp) => {  // stringify CXP in JSON
  if (outputJSON) {
    const json = toStr(CXPtoJSON(removeVoid(cxp)));
    if (json !== void 0)
      return json;
  }
  return stringifyComb(cxp);
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
        data = JSON.parse(code);
      } catch {
        try {
          data = LXPtoCXP(pegToLXP(parse(code)));
        } catch {
          data = void 0; // ignore input errors
        }
      }
      try {
        input = JSON.parse(inputElem);
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
        input2 = JSON.parse(input2Elem);
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
          const cxp = (!(!input) || input === false) ? (  // cxp to reduce
            (!(!input2) || input2 === false) ? [
              "app", [
                "app",
                cloneCXP(data),
                cloneCXP(input),
                void 0
              ],
              cloneCXP(input2),
              void 0
            ] : [
              "app",
              cloneCXP(data),
              cloneCXP(input),
              void 0
            ]
          ) : cloneCXP(data);  // no input if input is not given
          if (debug) {
            nextCXP = cxp;  // enter debug mode
            data = stringifyComb(cxp);
          } else {
            reduceCXP(cxp, true);  // reduce external code (subject to debugging)
            data = stringifyJSON(cxp);
          }
        //} catch {
        //  data = void 0;
        //  nextCXP = void 0;
        //}
      }
    } else {  // nextCXP !== void 0
      //try {
        const cxp = nextCXP;
        reduceCXP(cxp, true);  // reduce external code (subject to debugging)
        if (nextCXP !== void 0) {  // middle of debugging
          data = stringifyComb(cxp);
        } else {  // finished debugging
          data = stringifyJSON(cxp);
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