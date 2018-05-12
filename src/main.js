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
let f0 = new Func({
  type: 0,
  locals: [],
  body: new Expr([
    instrs.get('i32.const')(1),
    instrs.get('i32.const')(2),
    instrs.get('i32.add'),
  ])
});

let f1 = new Func({
  type: 1,
  locals: [ValType.f32],
  body: new Expr([
    instrs.get('block')(
        new ResultType(ValType.f32),
        [
          instrs.get('f32.const')(0),
          instrs.get('br')(0),
          instrs.get('br')(1),
          instrs.get('get_local')(0),
        ]),
    instrs.get('drop'),
  ])
});

let T0 = new Table({type: new TableType(new Limits(1), ElemType.anyfunc)});

let m0 = new Mem({type: new MemType(new Limits(1))});

let g0 = new Global({
  type: new GlobalType(Mut.var, ValType.i32),
  init: new Expr([
    instrs.get('get_global')(0),
  ])
});

let e0 = new Elem({
  table: 0,
  offset: new Expr([instrs.get('i32.const')(5)]),
  init: [0, 1, 0, 1]
});

let d0 = new Data({
  data: 0,
  offset: new Expr([instrs.get('i32.const')(1)]),
  init: [1, 2, 3, 4, 5],
});

let im0 = new Import({
  module: 'mod',
  name: 'g',
  desc: new ImportDesc('global', new GlobalType(Mut.const, ValType.i32))
});

let ex0 = new Export({name: 'f1', desc: new ExportDesc('func', 1)});

let M0 = new Module({
  types: [t0, t1],
  funcs: [f0, f1],
  tables: [T0],
  mems: [m0],
  globals: [g0],
  elem: [e0],
  data: [d0],
  imports: [im0],
  exports: [ex0]
});

print(moduleIsValid(M0));
