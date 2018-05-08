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

// http://webassembly.github.io/spec/core/valid/conventions.html#contexts
//
//    C ::= { types functype*,
//            funcs functype*,
//            tables tabletype*,
//            mems memtype*,
//            globals globaltype*,
//            locals valtype*,
//            labels resulttype*,
//            return resulttype? }
//
class Context {
  constructor({types, funcs, tables, mems, globals, locals, labels,
               'return': return_}) {
    assert(isArrayOfInstance(types, FuncType));
    assert(isArrayOfInstance(funcs, FuncType));
    assert(isArrayOfInstance(tables, TableType));
    assert(isArrayOfInstance(mems, MemType));
    assert(isArrayOfInstance(globals, GlobalType));
    assert(isArrayOfInstance(locals, ValType));
    assert(isArrayOfInstance(labels, ResultType));
    assert(isOptionalInstance(return_, ResultType));
    this.types = types;
    this.funcs = funcs;
    this.tables = tables;
    this.mems = mems;
    this.globals = globals;
    this.locals = locals;
    this.labels = labels;
    this.return = return_;
  }

  isType(idx) {
    assert(isIndex(idx));
    return idx < this.types.length;
  }

  getType(idx) {
    assert(this.isType(idx));
    return this.types[idx];
  }

  isFunc(idx) {
    assert(isIndex(idx));
    return idx < this.funcs.length;
  }

  getFunc(idx) {
    assert(this.isFunc(idx));
    return this.funcs[idx];
  }

  isTable(idx) {
    assert(isIndex(idx));
    return idx < this.tables.length;
  }

  getTable(idx) {
    assert(this.isTable(idx));
    return this.tables[idx];
  }

  isMem(idx) {
    assert(isIndex(idx));
    return idx < this.mems.length;
  }

  getMem(idx) {
    assert(this.isMem(idx));
    return this.mems[idx];
  }
}
