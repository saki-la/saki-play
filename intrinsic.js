export const intrinsic = {
  "Y": ["Bxy",1,["Sxy",1,["I"],["I"]],["Cxy",1,["B",1],["Sxy",1,["I"],["I"]]]],
  "F": ["Kx",1,["I"]],                 // x|y| y 
  "T": ["K",1],                        // x|y| x
  "not": ["C",1],                      // a|x|y| a y x
  "and": ["Cxy",2,["I"],["var","F"]],  // a|b| a b F
  "or": ["Cxy",1,["I"],["var","T"]],   // a|b| a T b
  // xor = a|b| a (not b) b
  "xor": ["Cxy",1,["Bxy",1,["S",1],["Cxy",1,["B",1],["var","not"]]],["I"]]
};
