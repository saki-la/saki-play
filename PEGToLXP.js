/*
  LXP (Lambda eXPression)
  ["lam", "varName", expr]
  ["app", exprX, exprY]
  ["var", "varName"]
  ["()"]
*/
const Ycomb = [
    // f| (x| x x) (x| f; x x)
    "lam", "f", [
        "app", [
            "lam", "x", [
                "app", ["var", "x"], ["var", "x"]
            ]
        ], [
            "lam", "x", [
                "app", [
                    "var", "f"
                ], [
                    "app", ["var", "x"], ["var", "x"]
                ]
            ]
        ]
    ], "Ycomb"
];
const exprToLXP = (expr) => {
    if (expr.length != 1) {
        throw new Error("expr should have only 1 element at exprToLXP");
    }
    const et = expr[0]; // top element in expr
    const ft = {
        "asExpr": () => {
            const [v, x, y] = et[1].reduce(([va, xa, ya], ea) => ({
                "ident": () => ea[1].reduce(([vi, xi, yi], ei) => ([vi + (ei[0] == "" ? ei[1] : ""), xi, yi]), [va, xa, ya]),
                "x": () => [va, ea[1], ya],
                "y": () => [va, xa, ea[1]],
                "sp": () => [va, xa, ya],
                "": () => [va, xa, ya] // literals; "=" or ";"
            })[ea[0]](), ["", void 0, void 0]);
            return [
                "app", [
                    "lam", v, exprToLXP(y)
                ], [
                    "app", Ycomb, ["lam", v, exprToLXP(x)]
                ], "asExpr"
            ];
        },
        "lambda": () => {
            const [v, x] = et[1].reduce(([vl, xl], el) => ({
                "ident": () => el[1].reduce(([vi, xi], ei) => ([vi + (ei[0] == "" ? ei[1] : ""), xi]), [vl, xl]),
                "x": () => [vl, el[1]],
                "sp": () => [vl, xl],
                "": () => [vl, xl] // literals; "|"
            })[el[0]](), ["", void 0]);
            return ["lam", v, exprToLXP(x), "lambda: ".concat(v)]; // (v| x)
        },
        "appS": () => {
            const [x, y] = et[1].reduce(([xa, ya], ea) => ({
                "x": () => [ea[1], ya],
                "y": () => [xa, ea[1]],
                "sp": () => [xa, ya],
                "": () => [xa, ya] // literals; ";"
            })[ea[0]](), [void 0, void 0]);
            return ["app", exprToLXP(x), exprToLXP(y), "appS"];
        },
        "appL": () => ( // application (list)  // x x x
        et[1].reduce((xa, ea) => ({
            "x": () => (xa === void 0) ? (exprToLXP(ea[1])) : [
                "app", xa, exprToLXP(ea[1])
            ],
            "sp": () => xa
        })[ea[0]](), void 0).concat(["appL"])),
        "paren": () => ( // parenthesis  // (x)
        et[1].reduce((xa, ea) => ({
            "x": () => exprToLXP(ea[1]),
            "sp": () => xa,
            "": () => xa // literals; "(" or ")"
        })[ea[0]](), ["()"]).concat(["paren"]) // expression can be omitted
        ),
        "ident": () => {
            const v = et[1].reduce((vi, ei) => (vi.concat(ei[0] == "" ? ei[1] : "")), "");
            return ["var", v, "ident(vref: ".concat(v).concat(")")];
        }
    }[et[0]];
    if (ft === undefined) {
        throw new Error("unknown label in expr at exprToLXP");
    }
    return ft();
};
export const pegToLXP = (peg) => (peg.reduce((xt, et) => ({
  "main": () => exprToLXP(et[1]),
  "sp": () => xt
})[et[0]](), ["()"]).concat(["main"])); // expression can be omitted

/*
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
        data = pegToLXP(data);
    }
    if (data !== undefined) {
        document.getElementById("output").textContent = JSON.stringify(data, null, 2);
    }
    else {
        document.getElementById("output").textContent = "(no output)";
    }
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
*/
