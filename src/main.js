//
// Copyright 2018 WebAssembly Community Group participants
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

load('helpers.js');
load('structure/types.js');
load('structure/instructions.js');
load('structure/modules.js');
load('validation/conventions.js');
load('validation/types.js');
load('validation/instructions.js');
load('validation/modules.js');

let f0 = new Func({type: 0, locals: [], body: new Expr([])});
let t0 = new FuncType([], []);

let c = new Context({
  types: [t0],
  funcs: [t0],
  tables: [],
  mems: [],
  globals: [],
  locals: [],
  labels: [],
  return: undefined,
});

print(funcIsValid(c, f0));