"use strict";
import { intrinsic } from "https://saki-la.github.io/saki-play/intrinsic.js";
import { parse } from "https://saki-la.github.io/saki-play/sakiMin.pegjs.js";
import { pegToLXP } from "https://saki-la.github.io/saki-play/PEGToLXP.js";
import { LXPtoCXP } from "https://saki-la.github.io/saki-play/LXPtoCXP.js";
import {
  setLibrary,
  CXPtoXRF,            // convert CXP to XRF
  reduceXRF,           // evaluation main
  XRFtoCXP, XRFtoJSON  // how to get the result
} from "https://saki-la.github.io/saki-play/eval.js";

setLibrary(Object.assign(intrinsic, {  // library in eval.js

}));

let outputJSON = true;  // output in JSON representation
let outputComb = true;  // output in combinator form
let outputStr = true;   // output as string (no escapes)
let compact = true;  // compacted JSON (no CRs or spaces)
let debugState = void 0;  // debug mode if not undefined

let forceLXP = false;

const AryToStr = (json) => {
  if (
    outputStr &&
    toString.call(json) == "[object Array]" &&
    json.reduce((a, e) => a && typeof e == "number", true)
  ) {
    const u8a = new Uint8Array(json);
    return new TextDecoder().decode(u8a); // UTF-8
  } else {
    return json;
  }
};
const NtoStr = (n) => (n == 1 ? "" : "" + n);
const CXPtoStr = (cxp) =>
  ({
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
  }[cxp[0]]());
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
    if (json !== void 0) return json;
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
      if (nd.childNodes != null) {
        return nodesToText(nd.childNodes);
      } else {
        return "";
      }
  }
};
const nodesToText = (ns) => {
  let t = "";
  ns.forEach((nd) => {
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
  let offsetIns = range.startOffset;   // offset to insert text in case of text node
  let textRemain = void 0;
  while (text.length > 0) {
    const line = (text.match(/^[^\r\n]+/) ?? [""])[0];
    if (line.length > 0) {
      if (nodeIns.nodeType == Node.TEXT_NODE) {
        const nodeText = nodeIns.textContent;
        if (textRemain === void 0) textRemain = nodeText.slice(offsetIns);
        const newText = nodeText.slice(0, offsetIns).concat(line);
        nodeIns.textContent = newText;
        offsetIns = newText.length;
      } else {
        const newNode = document.createTextNode(line);
        if (nodeIns.nodeName.toLowerCase() == "pre")
          nodeIns.appendChild(newNode);
        else nodeIns.parentNode.insertBefore(newNode, nodeIns.nextSibling);
        nodeIns = newNode;
        offsetIns = line.length;
        if (textRemain === void 0) textRemain = "";
      }
      text = text.slice(line.length);
    }
    const cr = (text.match(/^(\r\n|\n|\r)/) ?? [""])[0];
    if (cr.length > 0) {
      const newNode = document.createElement("br");
      nodeIns.parentNode.insertBefore(newNode, nodeIns.nextSibling);
      nodeIns = newNode;
      if (textRemain === void 0) textRemain = "";
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
  elemCode.textContent = ""; //"         1         2         3         4         5         6\n123456789012345678901234567890123456789012345678901234567890";
  elemCode.addEventListener("paste", pastePlainText);
  const elemInput = document.getElementById("input");
  elemInput.textContent = "";
  elemInput.addEventListener("paste", pastePlainText);
  const elemInput2 = document.getElementById("input2");
  elemInput.textContent = "";
  elemInput.addEventListener("paste", pastePlainText);
  const elemOutput = document.getElementById("output");
  const elemOutputResult = document.getElementById("output-result");
  const elemJSON = document.getElementById("outputJSON");
  const elemCXP = document.getElementById("StringfyCXP");
  const elemStr = document.getElementById("outputStr");
  const elemC = document.getElementById("LXP");
  const elemNext = document.getElementById("reduceNext");
  const elemReset = document.getElementById("reduceReset");
  const elemCopy = document.getElementById("copyToClipboard");
  const LXPStrToExpr = (lxp) => ({
    // (lam|app|var|js|ph| lam v x) = (B K4; C (C I v) x)
    "lam": () => [  // lambda
      "Bxy", 1, ["K", 4], [
        "Cxy", 1, [
          "Cxy", 1, ["I"], ["+", lxp[1]]  // v
        ], LXPStrToExpr(lxp[2])  // x
      ]
    ],
    // (lam|app|var|js|ph| app x y) = (K; B K3; C (C I x) y)
    "app": () => [  // application
      "Kx", 1, [
        "Bxy", 1, ["K", 3], [
          "Cxy", 1, [
            "Cxy", 1, ["I"], LXPStrToExpr(lxp[1])  // x
          ], LXPStrToExpr(lxp[2])  // y
        ]
      ]
    ],
    // (lam|app|var|js|ph| var v) = (K2; B K2; C I v)
    "var": () => [  // variable
      "Kx", 2, [
        "Bxy", 1, ["K", 2], [
          "Cxy", 1, ["I"], ["+", lxp[1]]  // v
        ]
      ]
    ],
    // (lam|app|var|js|ph| js j) = (K3; B K; C I j)
    "+": () => [  // JSON value (boolean, number, string, array)
      "Kx", 3, [
        "Bxy", 1, ["K", 1], [
          "Cxy", 1, ["I"], ["+", lxp[1]]  // j
        ]
      ]
    ],
    // (lam|app|var|js|ph| ph) = (K4 I)
    "()": () => ["Kx", 4, ["I"]]
  }[lxp[0]]());
  const updateOutput = (debug = false) => {
    let data;
    const code = nodesToText(elemCode.childNodes);
    const inputElem = nodesToText(elemInput.childNodes);

    if (!debug || debugState === void 0) {
      const input2Elem = nodesToText(elemInput2.childNodes);
      let input, input2;
      try {
        data = ["+", JSON.parse(code)];
      } catch {
        try {
          data = LXPtoCXP(pegToLXP(parse(code)));
        } catch {
          data = void 0;  // ignore input errors
        }
      }
      try {
        input = ["+", JSON.parse(inputElem)];
      } catch {
        try {
          if (forceLXP) {
            input = LXPStrToExpr(pegToLXP(parse(inputElem)));
          } else input = LXPtoCXP(pegToLXP(parse(inputElem)));
          if (input[0] == "()") input = void 0;
        } catch {
          input = void 0;  // ignore input errors
        }
      }
      try {
        input2 = ["+", JSON.parse(input2Elem)];
      } catch {
        try {
          input2 = LXPtoCXP(pegToLXP(parse(input2Elem)));
          if (input2[0] == "()") input2 = void 0;
        } catch {
          input2 = void 0;  // ignore input errors
        }
      }
      if (data !== void 0) {
        //try {
        const xrf =
          !!input || input === false  // xrf to reduce
            ? !!input2 || input2 === false
              ? [
                  "app",
                  ["app", CXPtoXRF(data), CXPtoXRF(input), void 0],
                  CXPtoXRF(input2),
                  void 0
                ]
              : ["app", CXPtoXRF(data), CXPtoXRF(input), void 0]
            : CXPtoXRF(data);  // no input if input is not given
        if (debug) {
          debugState = ["OK", "D1", 10000, [xrf]];  // enter debug mode
          elemOutputResult.textContent = "Start debugging";
          data = XRFtoComb(xrf);
        } else {
          const [, [sc, mc, ,]] = reduceXRF(xrf);  // reduce external code (subject to debugging)
          elemOutputResult.textContent = sc + " " + mc;
          data = XRFtoStr(xrf);
        }
        //} catch {
        //  data = void 0;
        //  nextCXP = void 0;
        //}
      }
    } else {  // debugState !== void 0
      //try {
      const xrf = debugState[3].pop();
      const [xrfNew, [sc, mc, cnt, apps]] = reduceXRF(xrf, debugState);  // reduce external code (subject to debugging)
      apps.push(xrfNew);
      elemOutputResult.textContent = sc + " " + mc;
      if (sc == "DB" && mc == "D2") {
        // middle of debugging
        debugState = ["OK", "D1", cnt, apps];
        data = XRFtoComb(apps[0]);
      } else {
        // finished debugging
        debugState = void 0;
        data = XRFtoStr(apps[0]);
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
    elemReset.disabled = debugState === void 0;
    elemNext.textContent = debugState === void 0 ? "Debug" : "Next";
  };  // updateOutput

  const obCode = new MutationObserver((mr) => {
    debugState = void 0;  // end debug mode
    updateOutput();
  });
  obCode.observe(elemCode, {
    childList: true,      // to observe the ENTER key
    characterData: true,  // and the other characters
    subtree: true
  });
  const obInput = new MutationObserver((mr) => {
    debugState = void 0;  // end debug mode
    updateOutput();
  });
  obInput.observe(elemInput, {
    childList: true,      // to observe the ENTER key
    characterData: true,  // and the other characters
    subtree: true
  });
  const obInput2 = new MutationObserver((mr) => {
    debugState = void 0;  // end debug mode
    updateOutput();
  });
  obInput2.observe(elemInput2, {
    childList: true,      // to observe the ENTER key
    characterData: true,  // and the other characters
    subtree: true
  });

  elemJSON.disabled = false;
  elemJSON.checked = outputJSON;
  elemJSON.addEventListener("click", () => {
    outputJSON = elemJSON.checked;
    updateOutput();
  });

  elemCXP.disabled = false;
  elemCXP.checked = outputComb;
  elemCXP.addEventListener("click", () => {
    outputComb = elemCXP.checked;
    updateOutput();
  });

  elemStr.disabled = false;
  elemStr.checked = outputStr;
  elemStr.addEventListener("click", () => {
    outputStr = elemStr.checked;
    updateOutput();
  });
  elemC.disabled = false;
  elemC.checked = forceLXP;
  elemC.addEventListener("click", () => {
    forceLXP = elemC.checked;
    updateOutput();
  });

  elemNext.addEventListener("click", () => {
    updateOutput(true); // debug mode
  });
  elemReset.addEventListener("click", () => {
    debugState = void 0; // end debug mode
    updateOutput();
  });
  elemCopy.addEventListener("click", () => {
    navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        navigator.clipboard.writeText(elemOutput.textContent);
      }
    });
  });
  updateOutput();  // initial output
});