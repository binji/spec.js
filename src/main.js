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
load('appendix/algorithm.js');

let t0 = new FuncType([], [ValType.i32]);
let t1 = new FuncType([], []);
let f0 = new Func({type: 0, locals: [], body: new Expr([
  instrs.get('i32.const')(1),
  instrs.get('i32.const')(2),
  instrs.get('i32.add'),
])});

let f1 = new Func({type: 1, locals: [ValType.f32], body: new Expr([
  instrs.get('block')(new ResultType(ValType.f32), [
    instrs.get('i32.const')(0),
    instrs.get('br')(0),
    instrs.get('br')(1),
    instrs.get('get_local')(0),
  ]),
  instrs.get('drop'),
])});

let m0 = new Module({
  types: [t0, t1],
  funcs: [f0, f1],
  tables: [],
  mems: [],
  globals: [],
  elem: [],
  data: [],
  imports: [],
  exports: []
});

print(moduleIsValid(m0));
