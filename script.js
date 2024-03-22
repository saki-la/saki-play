// code| replLam; LXPtoLCX code

// forceLXP = true
// code: x|y|b| x (y b iy j k) b  // NG
// code: x|y|b| x (y b yi j k) b  // OK
/*
((C2 ((B2 S)((C B)((C2 ((C2 (C2 I yi)))))))))
["LCX:app", [
"LCX:app",["LCX:C",2],["LCX:app",["LCX:app",["LCX:B",2],["LCX:S",1],false],["LCX:app",["LCX:app",["LCX:C",1],["LCX:B",2],false],["LCX:app",["LCX:app",["LCX:C",2],["LCX:app",["LCX:app",["LCX:C",2],["LCX:app",["LCX:app",["LCX:C",2],["LCX:I"],false],["LCX:var","yi"],["yi"]],["yi"]],["LCX:var","j"],["j","yi"]],["j","yi"]],["LCX:var","k"],["j","k","yi"]],["j","k","yi"]],["j","k","yi"]],["j","k","yi"]],["LCX:I"],["j","k","yi"]]
*/


"use strict";
import { intrSkip, intrinsic } from "https://saki-la.github.io/saki-play/intrinsic.js";
import { parse } from "https://saki-la.github.io/saki-play/sakiMin.pegjs.js";
import { pegToLXP } from "https://saki-la.github.io/saki-play/PEGToLXP.js";
import { LXPtoCXP } from "https://saki-la.github.io/saki-play/LXPtoCXP.js";
import {
  setLibrary, setDebugSkip,
  CXPtoXRF,             // convert CXP to XRF
  reduceXRF,            // evaluation main
  XRFtoCXP, XRFtoJSON,  // how to get the result
  XRFtoComb, XRFtoStr,
  setOutputJSON, setOutputComb, setOutputStr
} from "https://saki-la.github.io/saki-play/eval.js";

setLibrary(Object.assign(intrinsic, {  // library in eval.js
  "BnComb1": ["Kx",1,["Bxy",1,["K",3],["Bxy",2,["K",8],["Cx",1,["Cxy",1,["Cxy",1,["I"],["Kx",9,["I"]]],["Kx",9,["I"]]]]]]],
  "debug": ["I"]
}));

let outputJSON = true;  // output in JSON representation
let outputComb = true;  // output in combinator form
let outputStr = true;   // output as string (no escapes)
let compact = true;  // compacted JSON (no CRs or spaces)
let debugState = void 0;  // debug mode if not undefined
const debug1 = "V1";
const debug2 = "V2";
//const debug1 = "D1";
//const debug2 = "D2";
setDebugSkip(intrSkip);

let forceLXP = false;
const enableMyLXPtoCXP = false;

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
}[lxp[0]]());  // LXPStrToExpr
const MyLXPtoCXP = (lxp) => {
  if (enableMyLXPtoCXP && forceLXP) {
    const xrf = CXPtoXRF([
      "app", [
        "var", "LXPtoCXP"
      ], LXPStrToExpr(lxp)
    ]);
    const [, [sc, mc, ,]] = reduceXRF(xrf, ["OK", "ND", 1000000, []]);
    if (sc != "ER") 
      return XRFtoJSON(xrf);
    else
      return ["+", "LXPtoCXP: " + sc + " " + mc];
  } else {
    return LXPtoCXP(lxp);
  }
}

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
};  // pastePlainText

document.addEventListener("DOMContentLoaded", () => {
  const elemCode = document.getElementById("code");
  if (enableMyLXPtoCXP) {
    elemCode.textContent = "";
  } else {
    elemCode.textContent = "code| replLam; LXPtoLCX code"; //"         1         2         3         4         5         6\n123456789012345678901234567890123456789012345678901234567890";
  }
  
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
          data = MyLXPtoCXP(pegToLXP(parse(code)));
        } catch {
          data = void 0;  // ignore input errors
        }
      }
      try {
        input = ["+", JSON.parse(inputElem)];
      } catch {
        try {
          if (!enableMyLXPtoCXP && forceLXP) {
            input = LXPStrToExpr(pegToLXP(parse(inputElem)));
          } else {
            input = MyLXPtoCXP(pegToLXP(parse(inputElem)));
          }
          if (input[0] == "()") input = void 0;
        } catch {
          input = void 0;  // ignore input errors
        }
      }
      try {
        input2 = ["+", JSON.parse(input2Elem)];
      } catch {
        try {
          input2 = MyLXPtoCXP(pegToLXP(parse(input2Elem)));
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
          debugState = ["OK", debug1, 1000000, [xrf]];  // enter debug mode
          elemOutputResult.textContent = "Start debugging";
          data = XRFtoComb(xrf);
        } else {
          const [, [sc, mc, ,]] = reduceXRF(xrf, ["OK", "ND", 1000000, []]);  // reduce external code (subject to debugging)
          elemOutputResult.textContent = sc + " " + mc;
          if (sc != "ER" || mc != "EC") 
            data = XRFtoStr(xrf);
          else
            data = "N/A";
        }
        //} catch {
        //  data = void 0;
        //  nextCXP = void 0;
        //}
        data = data.slice(0, 10000);  // cut it short
      }
    } else {  // debugState !== void 0
      //try {
      const xrf = debugState[3].pop();
      const [xrfNew, [sc, mc, cnt, apps]] = reduceXRF(xrf, debugState);  // reduce external code (subject to debugging)
      apps.push(xrfNew);
      elemOutputResult.textContent = sc + " " + mc;
      if (sc == "DB" && mc == debug2) {
        // middle of debugging
        debugState = ["OK", debug1, cnt, apps];
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
  setOutputJSON(outputJSON);
  elemJSON.addEventListener("click", () => {
    outputJSON = elemJSON.checked;
    setOutputJSON(outputJSON);
    updateOutput();
  });

  elemCXP.disabled = false;
  elemCXP.checked = outputComb;
  setOutputComb(outputComb);
  elemCXP.addEventListener("click", () => {
    outputComb = elemCXP.checked;
    setOutputComb(outputComb);
    updateOutput();
  });

  elemStr.disabled = false;
  elemStr.checked = outputStr;
  setOutputStr(outputStr);
  elemStr.addEventListener("click", () => {
    outputStr = elemStr.checked;
    setOutputStr(outputStr);
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