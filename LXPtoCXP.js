/*
  LXP (Lambda eXPression)
  ["lam", "varName", expr]
  ["app", exprX, exprY]
  ["var", "varName"]
  ["()"]

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
  ["var", "varName"]
  ["()"]
*/
const compact = true; // whether the output is compacted
const addVFree = (lxp) => ({
    "lam": () => {
        const v = lxp[1];
        const x = addVFree(lxp[2]);
        const vfree = x[0].filter(e => e != v); // remove v
        return [vfree, "lam", v, x].concat(lxp.slice(3));
    },
    "app": () => {
        const x = addVFree(lxp[1]);
        const y = addVFree(lxp[2]);
        const vfree = new Set([...x[0], ...y[0]]); // union of the sets
        return [Array.from(vfree), "app", x, y].concat(lxp.slice(3));
    },
    "var": () => [[lxp[1]], "var", lxp[1]].concat(lxp.slice(2)),
    "()": () => [[], "()"].concat(lxp.slice(1))
})[lxp[0]]();
const toCXP = (lxp) => {
    var _a;
    return ((_a = {
        "lam": () => {
            const v = lxp[2];
            const x = lxp[3];
            const vfreeX = new Set(x[0]); // set of free variables
            if (vfreeX.has(v)) { // v is free in x
                return {
                    "lam": () => {
                        const xNew = toCXP(x); // convert the inner lambda first
                        if (xNew[1] == "lam")
                            throw new Error("toCXP should remove lambda");
                        return toCXP([lxp[0], "lam", v, xNew].concat(lxp.slice(4))); // then convert the outer lambda
                    },
                    "app": () => {
                        const xx = x[2];
                        const xy = x[3];
                        const vfreeXX = new Set(xx[0]);
                        const vfreeXY = new Set(xy[0]);
                        if (!vfreeXX.has(v)) { // v is free in xy, but xx
                            if (!vfreeXY.has(v)) // assume this since v is free in x here
                                throw new Error("in consistent set of free variables; lam->app in toCXP");
                            if (xy[1] == "var" && xy[2] == v) { // eta reduction
                                const xxNew = toCXP(xx);
                                return xxNew.concat(xy.slice(3)).concat(x.slice(4)).concat(lxp.slice(4)); // remove lambda and xy simply
                            }
                            else { // use B combinator instead of eta reduction
                                const xyNew = toCXP([xy[0].filter(e => e != v), "lam", v, xy]);
                                if (xx[1] == "app" && xx[2][1] == "B") { // combine into a Bn combinator
                                    const xyNew = toCXP([xy[0].filter(e => e != v), "lam", v, xy]);
                                    return [
                                        lxp[0],
                                        "app",
                                        [xx[0], "app", [[], "B", xx[2][2] + 1]].concat(xx.slice(3)),
                                        xyNew
                                    ].concat(x.slice(4)).concat(lxp.slice(4));
                                }
                                else { // B1 combinator
                                    const xxNew = toCXP(xx);
                                    return [
                                        lxp[0],
                                        "app",
                                        [xxNew[0], "app", [[], "B", 1], xxNew],
                                        xyNew
                                    ].concat(x.slice(4)).concat(lxp.slice(4));
                                }
                            }
                        }
                        else if (!vfreeXY.has(v)) { // v is free in xx, but xy
                            if (xx[1] == "app" && xx[2][1] == "C") { // Cn combinator
                                const xxyNew = toCXP([xx[0].filter(e => e != v), "lam", v, xx[3]]);
                                return [
                                    lxp[0],
                                    "app",
                                    [xxyNew[0], "app", [[], "C", xx[2][2] + 1], xxyNew].concat(xx.slice(4)),
                                    xy
                                ].concat(x.slice(4)).concat(lxp.slice(4));
                            }
                            else { // C1 combinator
                                const xxNew = toCXP([xx[0].filter(e => e != v), "lam", v, xx]);
                                const xyNew = toCXP(xy);
                                return [
                                    lxp[0],
                                    "app",
                                    [xxNew[0], "app", [[], "C", 1], xxNew],
                                    xyNew
                                ].concat(x.slice(4)).concat(lxp.slice(4));
                            }
                        }
                        else { // v is free in both xx and xy
                            const xyNew = toCXP([xy[0].filter(e => e != v), "lam", v, xy]);
                            if (xx[1] == "app" && xx[2][1] == "S") { // Sn combinator
                                const xxyNew = toCXP([xx[0].filter(e => e != v), "lam", v, xx[3]]);
                                return [
                                    lxp[0],
                                    "app",
                                    [xxyNew[0], "app", [[], "S", xx[2][2] + 1], xxyNew].concat(xx.slice(4)),
                                    xyNew
                                ].concat(x.slice(4)).concat(lxp.slice(4));
                            }
                            else { // S1 combinator
                                const xxNew = toCXP([xx[0].filter(e => e != v), "lam", v, xx]);
                                return [
                                    lxp[0],
                                    "app",
                                    [xxNew[0], "app", [[], "S", 1], xxNew],
                                    xyNew
                                ].concat(x.slice(4)).concat(lxp.slice(4));
                            }
                        }
                    },
                    "var": () => {
                        const xv = x[2];
                        if (xv != v)
                            throw new Error("inconsistent variable name; lam->var in toCXP");
                        return [lxp[0], "I"].concat(x.slice(3)).concat(lxp.slice(4));
                    }
                }[x[1]]();
            }
            else { // v is not free in x;   lxp [vfree, "lam", v, x, ...]
                const xNew = toCXP(x);
                if (xNew[1] == "app" && xNew[2][1] == "K") { // Kn combinator
                    return [lxp[0], "app", [[], "K", xNew[2][2] + 1]].concat(xNew.slice(3)).concat(lxp.slice(4));
                }
                else {
                    return [lxp[0], "app", [[], "K", 1], xNew].concat(lxp.slice(4));
                }
            }
        },
        "app": () => {
            const newX = toCXP(lxp[2]);
            const newY = toCXP(lxp[3]);
            if (newX === lxp[2] && newY === lxp[3]) {
                return lxp;
            }
            else {
                return [lxp[0], lxp[1], newX, newY].concat(lxp.slice(4));
            }
        }
    }[lxp[1]]) !== null && _a !== void 0 ? _a : (() => lxp))();
}; // assume: vfree is added to lxp
const removeVFree = (cxp) => {
    const conc = (a, x) => (compact) ? a : a.concat(x);
    return ({
        "Sxy": () => conc(["Sxy", cxp[2], cxp[3], cxp[4]], cxp.slice(5)),
        "Sx": () => conc(["Sx", cxp[2], cxp[3]], cxp.slice(4)),
        "S": () => conc(["S", cxp[2]], cxp.slice(3)),
        "Kx": () => conc(["Kx", cxp[2], cxp[3]], cxp.slice(4)),
        "K": () => conc(["K", cxp[2]], cxp.slice(3)),
        "Cxy": () => conc(["Cxy", cxp[2], cxp[3], cxp[4]], cxp.slice(5)),
        "Cx": () => conc(["Cx", cxp[2], cxp[3]], cxp.slice(4)),
        "C": () => conc(["C", cxp[2]], cxp.slice(3)),
        "Bxy": () => conc(["Bxy", cxp[2], cxp[3], cxp[4]], cxp.slice(5)),
        "Bx": () => conc(["Bx", cxp[2], cxp[3]], cxp.slice(4)),
        "B": () => conc(["B", cxp[2]], cxp.slice(3)),
        "I": () => conc(["I"], cxp.slice(2)),
        "app": () => {
            var _a;
            const x = cxp[2];
            const y = cxp[3];
            return ((_a = {
                "app": () => {
                    var _a;
                    const xx = x[2];
                    const xy = x[3];
                    return ((_a = {
                        "S": () => conc(conc(["Sxy", xx[2], removeVFree(xy), removeVFree(y)], x.slice(4)), cxp.slice(4)),
                        "C": () => conc(conc(["Cxy", xx[2], removeVFree(xy), removeVFree(y)], x.slice(4)), cxp.slice(4)),
                        "B": () => conc(conc(["Bxy", xx[2], removeVFree(xy), removeVFree(y)], x.slice(4)), cxp.slice(4))
                    }[xx[1]]) !== null && _a !== void 0 ? _a : (() => conc(["app", removeVFree(x), removeVFree(y)], cxp.slice(4))))();
                },
                "S": () => conc(["Sx", x[2], removeVFree(y)], cxp.slice(4)),
                "K": () => conc(["Kx", x[2], removeVFree(y)], cxp.slice(4)),
                "C": () => conc(["Cx", x[2], removeVFree(y)], cxp.slice(4)),
                "B": () => conc(["Bx", x[2], removeVFree(y)], cxp.slice(4))
            }[x[1]]) !== null && _a !== void 0 ? _a : (() => conc(["app", removeVFree(x), removeVFree(y)], cxp.slice(4))))();
        },
        "var": () => conc(["var", cxp[2]], cxp.slice(3)),
        "()": () => conc(["()"], cxp.slice(2))
    }[cxp[1]])();
};
export const LXPtoCXP = (lxp) => removeVFree(toCXP(addVFree(lxp)));
const nodeToText = (nd) => {
    switch (nd.nodeName.toLowerCase()) {
        case "#text":
            return nd.nodeValue;
        case "div": // new line
        case "p":
        case "br":
            return "\n" + nodesToText(nd.childNodes);
        default:
            if (nd.childNodes != null) {
                return nodesToText(nd.childNodes);
            }
            else {
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
    let data;
    try {
        data = JSON.parse(nodesToText(document.getElementById("input").childNodes));
    }
    catch (_a) {
    }
    if (data !== undefined) {
        data = LXPtoCXP(data);
    }
    let output;
    if (data !== undefined) {
        if (compact) {
            output = JSON.stringify(data);
        }
        else {
            output = JSON.stringify(data, null, 2);
        }
    }
    else {
        output = "(no output)";
    }
    document.getElementById("output").textContent = output;
};
document.getElementById("code").textContent = "         1         2         3         4         5         6\n123456789012345678901234567890123456789012345678901234567890";
document.getElementById("input").textContent = "";
updateOutput();
const obInput = new MutationObserver(mr => updateOutput());
obInput.observe(document.getElementById("input"), {
    childList: true,
    characterData: true,
    subtree: true
});