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
  "ltAry": ["Bxy",1,["var","Y"],["Cxy",3,["Bxy",3,["S",1],["Bxy",2,["Cx",1,["B",1]],["Cxy",5,["Bxy",2,["Cx",1,["B",2]],["Sxy",1,["Bxy",1,["B",1],["Bxy",1,["S",1],["Bxy",2,["B",1],["Bxy",2,["S",1],["Bxy",3,["B",1],["Cxy",3,["Bxy",2,["Cx",1,["I"]],["Cx",1,["I"]]],["var","T"]]]]]]],["Bxy",1,["C",1],["Bxy",2,["B",1],["Bxy",2,["C",1],["Bxy",3,["B",1],["Cxy",3,["Bxy",1,["Cx",1,["B",1]],["Cx",1,["I"]]],["var","F"]]]]]]]],["var","F"]]]],["Cxy",1,["Cxy",1,["I"],["Kx",2,["var","T"]]],["var","F"]]]],
  "ltNum": ["Cxy",1,["B",1],["Cxy",1,["B",8],["Cxy",16,["Cxy",16,["var","sub8"],["var","F"]],["Kx",8,["I"]]]]],
  "ltAry": ["Bxy",1,["var","Y"],["Cxy",3,["Bxy",3,["S",1],["Bxy",2,["Cx",1,["B",1]],["Cxy",5,["Bxy",2,["Cx",1,["B",2]],["Sxy",1,["Bxy",1,["B",1],["Bxy",1,["S",1],["Bxy",2,["B",1],["Bxy",2,["S",1],["Bxy",3,["B",1],["Cxy",3,["I"],["var","T"]]]]]]],["Bxy",1,["C",1],["Bxy",2,["B",1],["Bxy",2,["C",1],["Bxy",3,["B",1],["Cxy",3,["C",1],["var","F"]]]]]]]],["var","F"]]]],["Cxy",1,["Cxy",1,["I"],["Kx",2,["var","T"]]],["var","F"]]]],
  "ltStr": ["app",["var","ltAry"],["var","ltNum"]],
  "neStr": ["Sxy",2,["Bxy",2,["var","or"],["var","ltStr"]],["Cx",1,["var","ltStr"]]],
  "eqStr": ["Bxy",2,["var","not"],["var","neStr"]],
  "mergeSAry": ["Bxy",1,["var","Y"],["Cxy",3,["Bxy",3,["S",1],["Bxy",2,["Sx",1,["B",1]],["Cxy",2,["Bxy",2,["S",1],["Bxy",3,["C",3],["Bxy",3,["Sx",1,["B",2]],["Bxy",9,["K",1],["Sxy",2,["Bxy",2,["B",1],["Bxy",2,["C",1],["Bxy",3,["S",3],["Bxy",6,["B",1],["Bxy",6,["S",1],["Cxy",1,["Bxy",1,["B",2],["Bxy",1,["S",1],["Bxy",2,["B",1],["Bxy",2,["C",1],["Bx",2,["B",1]]]]]],["Bxy",2,["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]],["C",1]]]]]]]],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",2],["Bxy",4,["B",1],["Bxy",4,["S",3],["Cxy",1,["Bxy",1,["B",2],["Bxy",1,["C",1],["Bxy",2,["S",1],["Bxy",3,["B",2],["C",1]]]]],["Bx",1,["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]]],["Bx",1,["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]]]],["I"]]]],["I"]]],
  "splitHalfAry": ["Sxy",1,["app",["var","Y"],["Cxy",2,["Bxy",2,["S",1],["Bxy",1,["Cx",1,["B",1]],["Bxy",2,["K",1],["Cxy",1,["Bxy",1,["S",1],["Bxy",2,["C",1],["Bxy",2,["Cx",1,["I"]],["Bxy",2,["K",1],["Cxy",3,["Bxy",1,["Cx",1,["B",1]],["Cxy",2,["Bxy",2,["B",1],["Bx",1,["C",1]]],["Bxy",2,["C",1],["Bxy",2,["Cx",1,["I"]],["Bxy",3,["K",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]],["()"]]]]]],["Cx",1,["Cxy",1,["I"],["var","F"]]]]]]],["Cx",1,["Cxy",1,["I"],["var","F"]]]]],["I"]],
  "hasXInSAry": ["Bxy",1,["var","Y"],["Bxy",2,["Cx",1,["Bxy",1,["B",1],["var","splitHalfAry"]]],["Cxy",5,["Bxy",4,["Cx",1,["I"]],["Sxy",3,["Bxy",3,["C",1],["Bxy",4,["S",1],["Bxy",5,["B",1],["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["S",1],["Bxy",2,["B",1],["Bx",1,["C",1]]]]],["C",1]]]]],["Cxy",5,["Cxy",1,["Bxy",1,["B",1],["Bxy",1,["S",1],["Bxy",2,["C",1],["Bxy",3,["B",1],["C",1]]]]],["C",1]],["var","T"]]]],["var","F"]]]],
  "hasStrInSAry": ["app",["var","hasXInAry"],["var","ltStr"]],
  "removeXFromAry": ["Bxy",2,["var","Y"],["Cxy",4,["Bxy",3,["Cx",1,["I"]],["Cxy",2,["Bxy",2,["S",1],["Bxy",3,["C",1],["Bxy",4,["S",1],["Cxy",2,["Bxy",2,["B",1],["Bxy",2,["S",1],["Bx",2,["B",1]]]],["Bxy",4,["K",1],["Cx",1,["Bxy",1,["B",1],["Bxy",1,["C",1],["Cx",1,["I"]]]]]]]]]],["I"]]],["var","F"]]],
  "removeStrFromAry": ["app",["var","removeXFromAry"],["var","neStr"]],
  "str_lam": ["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["Kx",1,["I"]]],["Kx",1,["I"]]],["K",1]],["K",1]],["Kx",1,["I"]]],["K",1]],["K",1]],["Kx",1,["I"]]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["K",1]],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["K",1]],["K",1]],["Kx",1,["I"]]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["K",1]],["Kx",1,["I"]]],["K",1]],["K",1]],["Kx",1,["I"]]],["K",1]],["K",1]],["Kx",1,["I"]]]],["Kx",1,["I"]]]]]]]],
  "str_app": ["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["K",1]],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["K",1]],["K",1]],["Kx",1,["I"]]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["K",1]],["K",1]],["K",1]],["Kx",1,["I"]]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["K",1]],["K",1]],["K",1]],["Kx",1,["I"]]]],["Kx",1,["I"]]]]]]]],
  "str_var": ["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["Kx",1,["I"]]],["K",1]],["K",1]],["Kx",1,["I"]]],["K",1]],["K",1]],["K",1]],["Kx",1,["I"]]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["K",1]],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["K",1]],["K",1]],["Kx",1,["I"]]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["Kx",1,["I"]]],["K",1]],["Kx",1,["I"]]],["Kx",1,["I"]]],["K",1]],["K",1]],["K",1]],["Kx",1,["I"]]]],["Kx",1,["I"]]]]]]]],
  "str_ph": ["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["Kx",1,["I"]]],["Kx",1,["I"]]],["Kx",1,["I"]]],["K",1]],["Kx",1,["I"]]],["K",1]],["Kx",1,["I"]]],["Kx",1,["I"]]]],["Bxy",1,["K",1],["Cxy",1,["Cxy",1,["I"],["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["Cxy",1,["I"],["K",1]],["Kx",1,["I"]]],["Kx",1,["I"]]],["K",1]],["Kx",1,["I"]]],["K",1]],["Kx",1,["I"]]],["Kx",1,["I"]]]],["Kx",1,["I"]]]]]],
};
