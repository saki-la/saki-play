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


  sub2 x^B2 y^B2 b0^CB)^[B2,CB] := (
    [l,b1] = sub1 x[0] y[0] b0;
    [u,b2] = sub1 x[1] y[1] b1;
    [[l,u], b2]
  );

*/

const outputJSON = true;
const outputStr = true;
const compact = true;  // whether the output is compacted

const library = {
  // f| (x| x x) (x| f; x x)
  "Y": ["Bxy",1,["Sxy",1,["I"],["I"]],["Cxy",1,["B",1],["Sxy",1,["I"],["I"]]]],
  "F": ["Kx",1,["I"]],                 // x|y| y 
  "T": ["K",1],                        // x|y| x
  "not": ["C",1],                      // a|x|y| a y x
  "and": ["Cxy",2,["I"],["var","F"]],  // a|b| a b F
  "or": ["Cxy",1,["I"],["var","T"]],   // a|b| a T b
  // xor = a|b| a (not b) b
  "xor": ["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["B",1],["var","not"]]],["I"]],
  // sub1 = x|y|b| x (s| s (y b; not b); y b F) (s| s (y (not b) b); y T b)
  "sub1": ["Cxy",1,["Bxy",1,["S",2],["Cxy",1,["B",2],["Sxy",2,["Bxy",2,["Cx",1,["I"]],["Cxy",1,["S",1],["var","not"]]],["Cxy",2,["I"],["var","F"]]]]],["Sxy",2,["Bxy",2,["Cx",1,["I"]],["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["B",1],["var","not"]]],["I"]]],["Cxy",1,["I"],["var","T"]]]],
  // sub2 = x0|x1|y0|y1|b0| sub1 x0 y0 b0 (l0|l1|b1| sub1 x1 y1 b1; u0|u1|b2|s| s l0 l1 u0 u1 b2)
  "sub2": ["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Bxy",2,["B",1],["Bxy",2,["C",1],["var","sub1"]]]]],["Cxy",2,["Bxy",2,["B",2],["Bxy",2,["C",1],["var","sub1"]]],["Bxy",4,["C",1],["Bxy",3,["C",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]],
  // sub4 = x0|x1|x2|x3|y0|y1|y2|y3|b0| sub2 x0 x1 y0 y1 b0 (l0|l1|b1| sub2 x2 x3 y2 y3 b1; u0|u1|b2|s| s l0 l1 u0 u1 b2)
  "sub4": ["Cxy",2,["Bxy",2,["B",2],["Bxy",2,["C",2],["Bxy",4,["B",2],["Bxy",4,["C",1],["var","sub2"]]]]],["Cxy",4,["Bxy",4,["B",2],["Bxy",4,["C",1],["var","sub2"]]],["Bxy",4,["C",1],["Bxy",3,["C",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]],
  // sub8 = x0|x1|x2|x3|x4|x5|x6|x7|y0|y1|y2|y3|y4|y5|y6|y7|b0| sub4 x0 x1 x2 x3 y0 y1 y2 y3 b0 (l0|l1|l2|l3|b1| sub4 x4 x5 x6 x7 y4 y5 y6 y7 b1; u0|u1|u2|u3|b2|s| s l0 l1 l2 l3 u0 u1 u2 u3 b2)
  "sub8": ["Cxy",4,["Bxy",4,["B",4],["Bxy",4,["C",4],["Bxy",8,["B",4],["Bxy",8,["C",1],["var","sub4"]]]]],["Cxy",8,["Bxy",8,["B",4],["Bxy",8,["C",1],["var","sub4"]]],["Bxy",8,["C",1],["Bxy",7,["C",1],["Bxy",6,["C",1],["Bxy",5,["C",1],["Bxy",4,["C",1],["Bxy",3,["C",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]]]]
  // x|y|b| x (s| s (y b; (a|x|y| a y x) b) (y b; x|y| y)) (s| s (y ((a|x|y| a y x) b) b) (y (x|y| x) b))
  //"sub1": ["Cxy",1,["Bxy",1,["S",2],["Cxy",1,["B",2],["Sxy",2,["Bxy",2,["C",1],["Bxy",2,["Cx",1,["I"]],["Cxy",1,["S",1],["C",1]]]],["Cxy",2,["I"],["Kx",1,["I"]]]]]],["Sxy",2,["Bxy",2,["C",1],["Bxy",2,["Cx",1,["I"]],["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["B",1],["C",1]]],["I"]]]],["Cxy",1,["I"],["K",1]]]]
};

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
    reduceCXP(cxp);
    return removeVoid(cxp);
  }
}[cxp[0]])();
 
const reduceOne = (cxp, apps) => {  // reduce one step
  const popApp = () => {
    const newCXP = apps.pop();
    if (newCXP !== void 0) {
      if (newCXP[0] != "app" || newCXP[1] !== cxp)
        throw new Error("inconsistent cxp at ReduceOne")
      return [true, newCXP, apps];
    } else {
      return [false, cxp, apps];  // insufficient arguments
    }
  };
  return ({
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
    "app": () => {
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
        }
      }[x[0]] ?? (() => {
        apps.push(cxp);
        return [true, x, apps];
      }))();
    },  // cxp[0] == "app"
    "var": () => {  // cxp ["var", v, v0, v1]
      const fn = library[cxp[1]];
      if (fn !== void 0) {
        const newCXP = cloneCXP(fn);
        cxp[0] = newCXP[0];
        cxp[1] = newCXP[1];
        cxp[2] = newCXP[2];
        cxp[3] = newCXP[3];
        return [true, cxp, apps];
      } else {
        return [false, cxp, apps];  // undefined variable
      }
    },
    "()": () => [false, cxp, apps],  // reduce on placeholder
    "+": () => {  // cxp ["+", input, v0, v1]
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
    },
    "-": () => [false, cxp, apps]  // sentinel to output
  }[cxp[0]] ?? (() => [false, cxp, apps]))();
};

const reduceCXP = (cxpOrg) => {
  let [cont, cxp, apps] = reduceOne(cxpOrg, []);
  while (cont) {  // reduce loop
    //document.getElementById("output").textContent = JSON.stringify(cxp, null, 2);
    [cont, cxp, apps] = reduceOne(cxp, apps);
  }
  return [cxp, apps];
}

const toStr = (json) => {
  if (toString.call(json) == "[object Array]" &&

      json.reduce((a, e) => a && typeof e == "number", true)) {
    const u8a = new Uint8Array(json);
    return (new TextDecoder()).decode(u8a);  // UTF-8
  } else {
    return json;
  }
}

const CXPtoJSON = (cxp) => {  // convert CXP to JSON (or returns void 0)
  // give a sentinel to check its output
  cxp[1] = [...cxp];
  cxp[0] = "app";
  cxp[2] = ["-", true, void 0, void 0],  // sentinel to output true (boolean)
  cxp[3] = void 0;
  let [[sentl, sentlData], apps] = reduceCXP(cxp);

  // first check whether it is a number such as:
  //   (s| s K (K I) (K I) (K I) (K I) (K I) K (K I))
  //   => 65 = 0x41 = 0b01000001 = 'A'
  if (sentl == "-" && apps.length == 8) {
    // it may be a number
    let u8 = 0;  // unsigned 8 bits integer
    let bc = 0;
    for (let c = cxp; c[0] == "app"; c = c[1], ++bc) {
      const [[sl, sld], ap] = reduceCXP([
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

  // give another sentinel to check
  cxp[1] = [...cxp];
  cxp[0] = "app";
  cxp[2] = ["-", false, void 0, void 0],  // sentinel to output false
  cxp[3] = void 0;
  [[sentl, sentlData], apps] = reduceCXP(cxp);

  if (sentl == "-") {
    if (apps.length == 0) {  // boolean or an end of array (f|x| x)
      return sentlData;  // boolean false or true
    } else {
      const [app, x, y] = cxp;
      const [appX, xx, xy] = x;
      if (apps.length == 2 && app == "app" && appX == "app" && sentlData) {  // f|x| f data subArray
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
  return void 0;
};

const genOutputData = (cxpOrg, input) => {  // generate output data
  const cxp = (!(!input) || input === false) ? [  // cxp to reduce
    "app",
    cloneCXP(cxpOrg),
    ["+", input, void 0, void 0],  // sentinel to input
    void 0
  ] : cxpOrg;  // no input if input is not given
  reduceCXP(cxp);  // reduce without output
  if (outputJSON) {
    const json = toStr(CXPtoJSON(cloneCXP(cxp)));
    if (json !== void 0)
      return json;
  }
  return removeVoid(cxp);
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

const updateOutput = () => {
  let data, input;
  try {
    data = JSON.parse(nodesToText(document.getElementById("code").childNodes));
  } catch {
    // ignore input errors
  }
  try {
    input = JSON.parse(nodesToText(document.getElementById("input").childNodes));
  } catch {
    // ignore input errors
  }
  if (data !== undefined) {
    data = genOutputData(data, input);
  }
  if (data === undefined) {
    data = "(no output)";
  } else if (typeof data !== "string") {
    if (compact) {
      data = JSON.stringify(data);
    } else {
      data = JSON.stringify(data, null, 2);
    }
  }
  document.getElementById("output").textContent = data;
};

document.getElementById("code").textContent = "";  //"         1         2         3         4         5         6\n123456789012345678901234567890123456789012345678901234567890";
document.getElementById("input").textContent = "";
updateOutput();

const obCode = new MutationObserver(mr => updateOutput());
obCode.observe(document.getElementById("code"), {
  childList: true,      // to observe the ENTER key
  characterData: true,  // and the other characters
  subtree: true
});
const obInput = new MutationObserver(mr => updateOutput());
obInput.observe(document.getElementById("input"), {
  childList: true,      // to observe the ENTER key
  characterData: true,  // and the other characters
  subtree: true
});