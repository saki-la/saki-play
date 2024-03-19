export const intrSkip = [
  "Y",
  "F",
  "T",
  "not",
  "and",
  "or",
  "xor",
  "sub1",
  "sub2",
  "sub4",
  "sub8",
  "lt8",
  "inc1",
  "inc2",
  "inc4",
  "inc8",
  "incNum",
  "ltNum",
  "ltAry",
  "ltStr",
  "neStr",
  "splitHalfAry",
  "hasXInSAry",
  "removeXFromAry"
];

export const intrinsic = {
  "Y": ["Bxy",1,["Sxy",1,["I"],["I"]],["Cxy",1,["B",1],["Sxy",1,["I"],["I"]]]],
  "F": ["Kx",1,["I"]],
  "T": ["K",1],
  "not": ["C",1],
  "and": ["Cxy",2,["I"],["var","F"]],
  "or": ["Cxy",1,["I"],["var","T"]],
  "xor": ["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["B",1],["var","not"]]],["I"]],
  "sub1": ["Cxy",1,["Bxy",1,["S",2],["Cxy",1,["B",2],["Sxy",2,["Bxy",2,["C",1],["Bxy",2,["Cx",1,["I"]],["Cxy",1,["S",1],["var","not"]]]],["Cxy",2,["I"],["var","F"]]]]],["Sxy",2,["Bxy",2,["C",1],["Bxy",2,["Cx",1,["I"]],["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["B",1],["var","not"]]],["I"]]]],["Cxy",1,["I"],["var","T"]]]],
  "sub2": ["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Bxy",2,["B",1],["Bxy",2,["C",1],["var","sub1"]]]]],["Cxy",2,["Bxy",2,["B",1],["Bxy",2,["C",1],["var","sub1"]]],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]],
  "sub4": ["Cxy",2,["Bxy",2,["B",2],["Bxy",2,["C",2],["Bxy",4,["B",2],["Bxy",4,["C",1],["var","sub2"]]]]],["Cxy",4,["Bxy",4,["B",2],["Bxy",4,["C",1],["var","sub2"]]],["Bxy",4,["C",1],["Bxy",3,["C",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]],
  "sub8": ["Cxy",4,["Bxy",4,["B",4],["Bxy",4,["C",4],["Bxy",8,["B",4],["Bxy",8,["C",1],["var","sub4"]]]]],["Cxy",8,["Bxy",8,["B",4],["Bxy",8,["C",1],["var","sub4"]]],["Bxy",8,["C",1],["Bxy",7,["C",1],["Bxy",6,["C",1],["Bxy",5,["C",1],["Bxy",4,["C",1],["Bxy",3,["C",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]]]],
  "lt8": ["Cxy",16,["Cxy",16,["var","sub8"],["var","F"]],["Kx",8,["I"]]],
  "inc1": ["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["B",1],["Sxy",1,["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["var","not"]]],["I"]]]],["Cxy",2,["Cx",1,["I"]],["var","F"]]],
  "inc2": ["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["var","inc1"]]],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["var","inc1"]]],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]],
  "inc4": ["Cxy",2,["Bxy",2,["B",2],["Bxy",2,["C",1],["var","inc2"]]],["Cxy",2,["Bxy",2,["B",2],["Bxy",2,["C",1],["var","inc2"]]],["Bxy",4,["C",1],["Bxy",3,["C",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]],
  "inc8": ["Cxy",4,["Bxy",4,["B",4],["Bxy",4,["C",1],["var","inc4"]]],["Cxy",4,["Bxy",4,["B",4],["Bxy",4,["C",1],["var","inc4"]]],["Bxy",8,["C",1],["Bxy",7,["C",1],["Bxy",6,["C",1],["Bxy",5,["C",1],["Bxy",4,["C",1],["Bxy",3,["C",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]]]],
  "incNum": ["Cxy",1,["I"],["Cxy",8,["Cxy",8,["var","inc8"],["var","T"]],["Bxy",8,["K",1],["Bxy",7,["C",1],["Bxy",6,["C",1],["Bxy",5,["C",1],["Bxy",4,["C",1],["Bxy",3,["C",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]]]],
  "ltNum": ["Cxy",1,["B",1],["Cxy",1,["B",8],["Cxy",16,["Cxy",16,["var","sub8"],["var","F"]],["Kx",8,["I"]]]]],
  "ltAry": ["Bxy",1,["var","Y"],["Cxy",3,["Bxy",3,["S",1],["Bxy",2,["Cx",1,["B",1]],["Cxy",5,["Bxy",2,["Cx",1,["B",2]],["Sxy",1,["Bxy",1,["B",1],["Bxy",1,["S",1],["Bxy",2,["B",1],["Bxy",2,["S",1],["Bxy",3,["B",1],["Cxy",3,["I"],["var","T"]]]]]]],["Bxy",1,["C",1],["Bxy",2,["B",1],["Bxy",2,["C",1],["Bxy",3,["B",1],["Cxy",3,["C",1],["var","F"]]]]]]]],["var","F"]]]],["Cxy",1,["Cxy",1,["I"],["Kx",2,["var","T"]]],["var","F"]]]],
  "ltStr": ["app",["var","ltAry"],["var","ltNum"]],
  "neStr": ["Sxy",2,["Bxy",2,["var","or"],["var","ltStr"]],["Cx",1,["var","ltStr"]]],
  "eqStr": ["Bxy",2,["var","not"],["var","neStr"]],
  "mergeSAry": ["Bxy",1,["var","Y"],["Cxy",3,["Bxy",3,["S",1],["Bxy",2,["Sx",1,["B",1]],["Cxy",2,["Bxy",2,["S",1],["Bxy",3,["C",3],["Bxy",3,["Sx",1,["B",2]],["Bxy",9,["K",1],["Sxy",2,["Bxy",2,["B",1],["Bxy",2,["C",1],["Bxy",3,["S",3],["Bxy",6,["B",1],["Bxy",6,["S",1],["Cxy",1,["Bxy",1,["B",2],["Bxy",1,["S",1],["Bxy",2,["B",1],["Bxy",2,["C",1],["Bx",2,["B",1]]]]]],["Bxy",2,["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]],["C",1]]]]]]]],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",2],["Bxy",4,["B",1],["Bxy",4,["S",3],["Cxy",1,["Bxy",1,["B",2],["Bxy",1,["C",1],["Bxy",2,["S",1],["Bxy",3,["B",2],["C",1]]]]],["Bx",1,["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]]],["Bx",1,["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]]]],["I"]]]],["I"]]],
  "splitHalfAry": ["Sxy",1,["app",["var","Y"],["Cxy",2,["Bxy",2,["S",1],["Bxy",1,["Cx",1,["B",1]],["Bxy",2,["K",1],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Bxy",2,["Cx",1,["I"]],["Bxy",2,["K",1],["Cxy",3,["Bxy",1,["Cx",1,["B",1]],["Cxy",2,["Bxy",2,["B",1],["Bx",1,["C",1]]],["Bxy",2,["C",1],["Bxy",2,["Cx",1,["I"]],["Bxy",3,["K",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]],["()"]]]]]],["Cx",1,["Cxy",1,["I"],["var","F"]]]]]]],["Cx",1,["Cxy",1,["I"],["var","F"]]]]],["I"]],
  "hasXInSAry": ["Bxy",1,["var","Y"],["Bxy",2,["Cx",1,["Bxy",1,["B",1],["var","splitHalfAry"]]],["Cxy",5,["Bxy",4,["Cx",1,["I"]],["Sxy",3,["Bxy",3,["C",1],["Bxy",4,["S",1],["Bxy",5,["B",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["S",1],["Bxy",2,["B",1],["Bx",1,["C",1]]]]],["C",1]]]]],["Cxy",5,["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["S",1],["Bxy",2,["C",1],["Bxy",3,["B",1],["C",1]]]]],["C",1]],["var","T"]]]],["var","F"]]]],
  "hasStrInSAry": ["app",["var","hasXInSAry"],["var","ltStr"]],
  "removeXFromAry": ["Bxy",2,["var","Y"],["Cxy",4,["Bxy",3,["Cx",1,["I"]],["Cxy",2,["Bxy",2,["S",1],["Bxy",3,["C",1],["Bxy",4,["S",1],["Cxy",2,["Bxy",2,["B",1],["Bxy",2,["S",1],["Bx",2,["B",1]]]],["Bxy",4,["K",1],["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]],["I"]]],["var","F"]]],
  "removeStrFromAry": ["app",["var","removeXFromAry"],["var","neStr"]],
  "vfreeLCX": ["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["Kx",2,["I"]]],["Kx",2,["I"]]],["Bxy",2,["K",1],["Cxy",2,["Cx",1,["I"]],["var","F"]]]],["Kx",1,["var","F"]]],["var","F"]],["Kx",1,["var","F"]]],["Kx",1,["var","F"]]],["Kx",1,["var","F"]]],["Kx",1,["var","F"]]],["var","F"]],
  "LXPtoLCX": ["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["app",["Cx",1,["Bxy",1,["B",1],["Bxy",3,["K",9],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["var","removeStrFromAry"]],["var","vfreeLCX"]]]]]],["app",["Sxy",1,["I"],["I"]],["app",["I"],["app",["Cxy",1,["B",1],["Sxy",1,["I"],["I"]]],["Cxy",2,["Cxy",2,["Cxy",2,["Sxy",1,["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["Cx",1,["Bxy",1,["B",1],["Bxy",3,["K",9],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["var","removeStrFromAry"]],["var","vfreeLCX"]]]]]]]],["Sxy",1,["Bxy",1,["C",1],["Bxy",2,["B",1],["Bx",1,["Bxy",2,["K",1],["Bxy",3,["K",8],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["app",["var","mergeSAry"],["var","ltStr"]],["var","vfreeLCX"]]],["var","vfreeLCX"]]]]]]]],["I"]]],["Bxy",1,["K",2],["Bxy",2,["K",7],["Cx",1,["I"]]]]],["Bxy",1,["K",3],["Bxy",2,["K",6],["Cx",1,["I"]]]]],["Kx",4,["K",5]]]]]]]],["app",["Sxy",1,["Bxy",1,["C",1],["Bxy",2,["B",1],["Bx",1,["Bxy",2,["K",1],["Bxy",3,["K",8],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["app",["var","mergeSAry"],["var","ltStr"]],["var","vfreeLCX"]]],["var","vfreeLCX"]]]]]]]],["I"]],["app",["Sxy",1,["I"],["I"]],["app",["I"],["app",["Cxy",1,["B",1],["Sxy",1,["I"],["I"]]],["Cxy",2,["Cxy",2,["Cxy",2,["Sxy",1,["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["Cx",1,["Bxy",1,["B",1],["Bxy",3,["K",9],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["var","removeStrFromAry"]],["var","vfreeLCX"]]]]]]]],["Sxy",1,["Bxy",1,["C",1],["Bxy",2,["B",1],["Bx",1,["Bxy",2,["K",1],["Bxy",3,["K",8],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["app",["var","mergeSAry"],["var","ltStr"]],["var","vfreeLCX"]]],["var","vfreeLCX"]]]]]]]],["I"]]],["Bxy",1,["K",2],["Bxy",2,["K",7],["Cx",1,["I"]]]]],["Bxy",1,["K",3],["Bxy",2,["K",6],["Cx",1,["I"]]]]],["Kx",4,["K",5]]]]]]]],["Bxy",1,["K",2],["Bxy",2,["K",7],["Cx",1,["I"]]]]],["Bxy",1,["K",3],["Bxy",2,["K",6],["Cx",1,["I"]]]]],["Kx",4,["K",5]]],
  "isVarNamedV": ["Cxy",2,["Cxy",2,["Cxy",2,["Cxy",2,["Cxy",2,["Cxy",2,["Cxy",2,["Bxy",1,["Cx",1,["Cxy",1,["Cxy",1,["I"],["Kx",3,["var","F"]]],["Kx",3,["var","F"]]]],["var","eqStr"]],["Kx",1,["var","F"]]],["var","F"]],["Kx",1,["var","F"]]],["Kx",1,["var","F"]]],["Kx",1,["var","F"]]],["Kx",1,["var","F"]]],["var","F"]],
  "combExist": ["Cxy",5,["Bxy",5,["S",1],["Cxy",5,["Bxy",5,["S",1],["Cxy",5,["Bxy",5,["S",1],["Cxy",5,["Bxy",5,["S",1],["Cxy",5,["Bxy",5,["S",1],["Cxy",5,["Bxy",5,["S",1],["Cxy",5,["Bxy",5,["S",1],["Cxy",5,["Bxy",5,["S",1],["Cxy",1,["Bxy",1,["B",4],["Bxy",1,["S",1],["Cxy",1,["B",1],["K",3]]]],["Cxy",4,["Bxy",4,["S",1],["Bxy",5,["C",3],["Bxy",3,["C",2],["Bxy",5,["S",2],["Bxy",2,["C",2],["Bxy",4,["S",2],["Bxy",1,["C",2],["Bxy",3,["S",2],["Cx",2,["Bxy",2,["B",2],["Sxy",1,["Bxy",1,["C",1],["Sxy",1,["Bxy",1,["C",1],["Sxy",1,["Bxy",1,["C",1],["Sxy",1,["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["K",3]]],["K",3]]],["K",1]]],["K",1]]],["I"]]]]]]]]]]]],["I"]]]],["K",1]]],["K",1]]],["I"]]],["K",1]]],["K",1]]],["K",1]]],["K",1]]],["I"]],
  "BnComb": ["Bxy",1,["Cx",2,["Bxy",2,["B",1],["Sxy",3,["Cxy",3,["Bxy",3,["S",1],["Bxy",1,["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["Bxy",1,["B",1],["var","combExist"]],["K",3]]],["K",3]]],["K",3]]]]],["Bxy",3,["K",1],["Cxy",2,["Bxy",2,["B",1],["Bxy",2,["C",1],["Bxy",4,["K",1],["Bxy",5,["K",8],["Cx",4,["Cx",3,["Bxy",2,["Cx",1,["I"]],["Bxy",2,["K",1],["Bxy",3,["K",8],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["Bxy",1,["K",8],["Bxy",2,["K",1],["Bxy",1,["Cx",1,["I"]],["var","incNum"]]]]]]]],["var","vfreeLCX"]]]]]]]]]]],["var","replLam"]]]]],["I"]],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Bxy",3,["K",1],["Bxy",4,["K",8],["Cx",3,["Cx",2,["Bxy",1,["Cx",1,["I"]],["Bxy",1,["K",1],["Bxy",2,["K",8],["Sxy",1,["Bxy",1,["C",1],["Cx",1,["Cxy",1,["I"],["Kx",8,["Bxy",1,["K",1],["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]]]]]]]],["var","vfreeLCX"]]]]]]]]]]],["var","replLam"]]]]],["Bxy",2,["var","replLam"],["Bxy",3,["K",9],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["var","removeStrFromAry"]],["var","vfreeLCX"]]]]]],
  "CnComb": ["Cxy",3,["Bxy",3,["B",1],["Sxy",4,["Cxy",4,["Bxy",4,["S",1],["Cxy",4,["Bxy",4,["S",1],["Bxy",2,["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["Bxy",1,["B",1],["var","combExist"]],["K",3]]],["K",3]]]]],["Bxy",1,["Cx",2,["Bxy",2,["B",2],["Bxy",2,["C",1],["Bxy",4,["K",1],["Bxy",5,["K",8],["Cx",4,["Cx",3,["Bxy",2,["Cx",1,["I"]],["Bxy",2,["K",1],["Bxy",3,["K",8],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["Bxy",1,["K",7],["Bxy",2,["K",2],["Bxy",1,["Cx",1,["I"]],["var","incNum"]]]]]]]],["var","vfreeLCX"]]]]]]]]]]]],["Bxy",3,["var","replLam"],["Bxy",4,["K",9],["Sxy",1,["Bxy",1,["C",1],["Bxy",2,["B",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]],["var","removeStrFromAry"]]]]]]],["K",3]]],["I"]],["Bxy",1,["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Bxy",3,["K",1],["Bxy",4,["K",8],["Cx",3,["Cx",2,["Bxy",1,["Cx",1,["I"]],["Bxy",1,["K",1],["Bxy",2,["K",8],["Sxy",1,["Bxy",1,["C",1],["Cx",1,["Cxy",1,["I"],["Kx",7,["Bxy",1,["K",2],["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]]]]]]]],["var","vfreeLCX"]]]]]]]]]]]],["Bxy",2,["var","replLam"],["Bxy",3,["K",9],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["var","removeStrFromAry"]],["var","vfreeLCX"]]]]]]]],["var","replLam"]],
  "KnComb": ["Bxy",1,["Sxy",1,["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["Bxy",1,["S",1],["Cxy",2,["Cxy",1,["Bxy",1,["B",1],["var","combExist"]],["K",3]],["Bxy",3,["K",1],["Bxy",4,["K",8],["Bxy",1,["C",2],["Cx",2,["Bxy",1,["Cx",1,["I"]],["Bxy",1,["K",6],["Bxy",2,["K",3],["Bxy",1,["Cx",1,["I"]],["var","incNum"]]]]]]]]]]],["K",3]]],["K",3]]],["I"]],["Bxy",1,["K",1],["Bxy",2,["K",8],["Sxy",1,["Bxy",1,["C",1],["Cx",1,["Cxy",1,["I"],["Kx",6,["Bxy",1,["K",3],["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]]]]]]]],["var","vfreeLCX"]]]]],["var","replLam"]],
  "SnComb": ["Sxy",1,["Bxy",1,["C",2],["Bxy",3,["B",1],["Sxy",4,["Cxy",4,["Bxy",4,["S",1],["Cxy",4,["Bxy",4,["S",1],["Cxy",4,["Bxy",4,["S",1],["Cxy",4,["Bxy",4,["B",1],["Bxy",2,["Cx",1,["Bxy",1,["B",1],["var","combExist"]]],["Bxy",1,["Cx",2,["Bxy",2,["B",2],["Bxy",2,["C",1],["Bxy",4,["K",1],["Bxy",5,["K",8],["Cx",4,["Cx",3,["Bxy",2,["Cx",1,["I"]],["Bxy",2,["K",1],["Bxy",3,["K",8],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["Bxy",1,["K",5],["Bxy",2,["K",4],["Bxy",1,["Cx",1,["I"]],["var","incNum"]]]]]]]],["var","vfreeLCX"]]]]]]]]]]]],["Bxy",3,["var","replLam"],["Bxy",4,["K",9],["Sxy",1,["Bxy",1,["C",1],["Bxy",2,["B",1],["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]],["var","removeStrFromAry"]]]]]]],["K",3]]],["K",3]]],["K",3]]],["I"]],["Bxy",1,["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Bxy",3,["K",1],["Bxy",4,["K",8],["Cx",3,["Cx",2,["Bxy",1,["Cx",1,["I"]],["Bxy",1,["K",1],["Bxy",2,["K",8],["Sxy",1,["Bxy",1,["C",1],["Cx",1,["Cxy",1,["I"],["Kx",5,["Bxy",1,["K",4],["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]]]]]]]],["var","vfreeLCX"]]]]]]]]]]]],["Bxy",2,["var","replLam"],["Bxy",3,["K",9],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["var","removeStrFromAry"]],["var","vfreeLCX"]]]]]]]]],["Bxy",2,["var","replLam"],["Bxy",3,["K",9],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["var","removeStrFromAry"]],["var","vfreeLCX"]]]]]],
  "caseVFreeInLam": ["Cxy",3,["Cxy",3,["Cxy",3,["Cxy",3,["Cxy",3,["Cxy",3,["Cxy",3,["Cxy",3,["Sxy",1,["Bxy",1,["C",1],["Bxy",2,["S",1],["Bxy",1,["Sx",1,["B",1]],["Bxy",3,["K",3],["Bxy",3,["var","replLam"],["Bxy",4,["K",9],["Bxy",2,["C",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["var","replLam"]]]]]]]]],["Bxy",4,["K",1],["Sxy",4,["Sxy",1,["Bxy",1,["B",1],["Bxy",1,["S",1],["Bxy",2,["B",1],["Cx",1,["Bxy",1,["var","hasStrInSAry"],["var","vfreeLCX"]]]]]],["Sxy",4,["Sxy",1,["Bxy",1,["B",2],["Bxy",1,["S",1],["Cx",1,["Bxy",1,["var","hasStrInSAry"],["var","vfreeLCX"]]]]],["var","SnComb"]],["var","CnComb"]]],["Sxy",1,["Bxy",1,["B",1],["Bxy",1,["S",2],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["var","isVarNamedV"]]],["var","replLam"]]]],["var","BnComb"]]]]],["Kx",10,["I"]]],["Kx",1,["()"]]],["()"]],["Kx",1,["()"]]],["Kx",1,["()"]]],["Kx",1,["()"]]],["Kx",1,["()"]]],["()"]],
  "replLam": ["Sxy",1,["Sxy",1,["Sxy",1,["Sxy",1,["Sxy",1,["Sxy",1,["Sxy",1,["Sxy",1,["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Sxy",2,["Bxy",2,["B",1],["Cx",1,["Bxy",1,["var","hasStrInSAry"],["var","vfreeLCX"]]]],["var","caseVFreeInLam"]]]],["var","KnComb"]]],["Bxy",2,["K",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["Bxy",2,["K",1],["Bxy",3,["K",8],["Sxy",2,["Bxy",2,["C",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["app",["var","mergeSAry"],["var","ltStr"]],["var","vfreeLCX"]]],["var","vfreeLCX"]]]]],["var","replLam"]]],["var","replLam"]]]],["K",1]],["K",1]],["I"]],["K",1]],["K",1]],["K",1]],["K",1]],["I"]],
  "CXP_Sxy": ["Bxy",4,["K",1],["Bxy",3,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]]]]]],["Bxy",4,["K",1],["Cxy",1,["Bxy",1,["B",2],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Bxy",3,["K",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]]]],["Bxy",2,["K",1],["Cxy",2,["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]],["Kx",1,["I"]]]]]]]]]],
  "CXP_Sx": ["Bxy",3,["K",1],["Bxy",2,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]]]],["Bxy",3,["K",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Bxy",2,["K",1],["Cxy",2,["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]],["Kx",1,["I"]]]]]]]],
  "CXP_S": ["Bxy",2,["K",1],["Bxy",1,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]],["Bxy",2,["K",1],["Cxy",2,["Cx",1,["I"]],["Kx",1,["I"]]]]]],
  "CXP_Kx": ["Bxy",3,["K",1],["Bxy",2,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","T"]],["var","F"]],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]]]],["Bxy",3,["K",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Bxy",2,["K",1],["Cxy",2,["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]],["Kx",1,["I"]]]]]]]],
  "CXP_K": ["Bxy",2,["K",1],["Bxy",1,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","T"]],["var","F"]],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]],["Bxy",2,["K",1],["Cxy",2,["Cx",1,["I"]],["Kx",1,["I"]]]]]],
  "CXP_Cxy": ["Bxy",4,["K",1],["Bxy",3,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]]]]]],["Bxy",4,["K",1],["Cxy",1,["Bxy",1,["B",2],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Bxy",3,["K",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]]]],["Bxy",2,["K",1],["Cxy",2,["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]],["Kx",1,["I"]]]]]]]]]],
  "CXP_Cx": ["Bxy",3,["K",1],["Bxy",2,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]]]],["Bxy",3,["K",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Bxy",2,["K",1],["Cxy",2,["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]],["Kx",1,["I"]]]]]]]],
  "CXP_C": ["Bxy",2,["K",1],["Bxy",1,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]],["Bxy",2,["K",1],["Cxy",2,["Cx",1,["I"]],["Kx",1,["I"]]]]]],
  "CXP_I": ["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]],["Kx",1,["I"]]]],
  "CXP_Bxy": ["Bxy",4,["K",1],["Bxy",3,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]]]]]],["Bxy",4,["K",1],["Cxy",1,["Bxy",1,["B",2],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Bxy",3,["K",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]]]],["Bxy",2,["K",1],["Cxy",2,["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]],["Kx",1,["I"]]]]]]]]]],
  "CXP_Bx": ["Bxy",3,["K",1],["Bxy",2,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]]]],["Bxy",3,["K",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]],["Bxy",2,["K",1],["Cxy",2,["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]],["Kx",1,["I"]]]]]]]],
  "CXP_B": ["Bxy",2,["K",1],["Bxy",1,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]],["Bxy",2,["K",1],["Cxy",2,["Cx",1,["I"]],["Kx",1,["I"]]]]]],
  "CXP_I": ["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]],["Kx",1,["I"]]]],
  "CXP_app": ["Bxy",3,["K",1],["Bxy",2,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]]]]]],["Bxy",3,["K",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]]]],["Bxy",2,["K",1],["Cxy",2,["Bxy",1,["Cx",1,["I"]],["var","LCXtoCXP"]],["Kx",1,["I"]]]]]]]],
  "CXP_var": ["Bxy",2,["K",1],["Bxy",1,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","T"]],["var","T"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","T"]],["var","T"]],["var","F"]]],["Kx",1,["I"]]]]]]]]]],["Bxy",2,["K",1],["Cxy",2,["Cx",1,["I"]],["Kx",1,["I"]]]]]],
  "CXP_ph": ["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","F"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]],["var","T"]],["var","F"]],["var","F"]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","F"]],["var","F"]],["var","T"]],["var","F"]],["var","T"]],["var","F"]],["var","F"]]],["Kx",1,["I"]]]]]]],["Kx",1,["I"]]]],
  "CXP_json": ["Bxy",2,["K",1],["Bxy",1,["Cx",1,["Cxy",1,["I"],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["var","T"]],["var","T"]],["var","F"]],["var","T"]],["var","F"]],["var","T"]],["var","F"]],["var","F"]]],["Kx",1,["I"]]]]]],["Bxy",2,["K",1],["Cxy",2,["Cx",1,["I"]],["Kx",1,["I"]]]]]],
  "LCXtoCXP": ["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["Kx",3,["()"]]],["Bxy",2,["K",1],["Sxy",2,["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Cxy",2,["Bxy",2,["S",1],["Cxy",2,["Bxy",2,["S",1],["Cxy",2,["Bxy",2,["S",1],["Cxy",1,["Bxy",1,["B",2],["Cxy",1,["I"],["Kx",3,["()"]]]],["Bxy",4,["K",1],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",2],["Sxy",1,["Bxy",1,["C",2],["Bxy",3,["S",1],["Sxy",1,["Bxy",1,["C",2],["Bxy",3,["S",1],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",2],["Bxy",1,["Cx",2,["Bxy",2,["B",1],["Sxy",1,["Bxy",1,["C",1],["Sxy",1,["Bxy",1,["C",1],["Sxy",1,["Bxy",1,["C",1],["Bxy",1,["Cx",1,["Cxy",1,["I"],["Kx",3,["()"]]]],["K",3]]],["K",1]]],["K",1]]],["I"]]]],["Cx",2,["Cx",1,["var","CXP_Sxy"]]]]]],["K",1]]]],["Cx",2,["Cx",1,["var","CXP_Cxy"]]]]]],["Cx",2,["Cx",1,["var","CXP_Bxy"]]]]]],["I"]]]]],["K",1]]],["K",1]]],["I"]]]],["Cx",1,["var","CXP_Sx"]]]]],["Cx",1,["var","CXP_Kx"]]]]],["Cx",1,["var","CXP_Cx"]]]]],["Cx",1,["var","CXP_Bx"]]]]],["I"]],["var","CXP_app"]]]],["var","CXP_var"]],["var","CXP_json"]],["var","CXP_ph"]],["var","CXP_S"]],["var","CXP_K"]],["var","CXP_C"]],["var","CXP_B"]],["var","CXP_I"]],
  "LXPtoCXP": ["Bxy",1,["var","LCXtoCXP"],["Bxy",1,["var","replLam"],["var","LXPtoLCX"]]]
};
