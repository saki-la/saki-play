export const intrinsic = {
  "Y": ["Bxy",1,["Sxy",1,["I"],["I"]],["Cxy",1,["B",1],["Sxy",1,["I"],["I"]]]],
  "F": ["Kx",1,["I"]],                 // x|y| y 
  "T": ["K",1],                        // x|y| x
  "not": ["C",1],                      // a|x|y| a y x
  "and": ["Cxy",2,["I"],["var","F"]],  // a|b| a b F
  "or": ["Cxy",1,["I"],["var","T"]],   // a|b| a T b
  // xor = a|b| a (not b) b
  "xor": ["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["B",1],["var","not"]]],["I"]],
  // sub1 = x|y|b| x (s| s (y b; not b); y b F) (s| s (y (not b) b); y T b)
  "sub1": ["Cxy",1,["Bxy",1,["S",2],["Cxy",1,["B",2],["Sxy",2,["Bxy",2,["C",1],["Bxy",2,["Cx",1,["I"]],["Cxy",1,["S",1],["var","not"]]]],["Cxy",2,["I"],["var","F"]]]]],["Sxy",2,["Bxy",2,["C",1],["Bxy",2,["Cx",1,["I"]],["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["B",1],["var","not"]]],["I"]]]],["Cxy",1,["I"],["var","T"]]]]
};
