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

// http://webassembly.github.io/spec/core/valid/modules.html#functions
//
//     { type x, locals t*, body expr }
//
function funcIsValid(C, func) {
  assert(isInstance(C, Context));
  assert(isInstance(func, Func));
  let {type: x, locals: t, body: expr} = func;

  // The type `C.types[x]` must be defined in the context.
  if (!C.isType(x)) {
    return false;
  }

  // Let `[t_1^*] -> [t_2^?]` be the function type `C.types[x]`.
  let functype = C.getType(x);
  let {params: t1, results: [t2]} = functype;

  // Let C' be the same context as C, but with:
  let resulttype = new ResultType(t2);
  let C1 = new Context({
    types: C.types,
    funcs: C.funcs,
    tables: C.tables,
    mems: C.mems,
    globals: C.globals,
    // `locals` set to the sequence of value types `t_1* t*`, concatenating
    // parameters and locals.
    locals: t1.concat(t),
    // `labels` set to the singular sequence containing only result type
    // `[t_2^?]`.
    labels: [resulttype],
    // `return` set to the result type `[t_2^?]`.
    return: resulttype
  });

  // Under the Context C', the expression expr must be valid with type `t_2^?`.
  if (!exprIsValidWithResultType(C1, expr, resulttype)) {
    return false;
  }

  // Then the function definition is valid with type `[t_1^*] -> [t_2^?]`.
  return functype;
}

// http://webassembly.github.io/spec/core/valid/modules.html#tables
//
//     { type tabletype }
//
function tableIsValid(C, table) {
  assert(isInstance(C, Context));
  assert(isInstance(table, Table));

  // The table type `tabletype` must be valid.
  if (!tableTypeIsValid(table.type)) {
    return false;
  }

  // Then the table definition is valid with type `tabletype`.
  return table.type;
}

// http://webassembly.github.io/spec/core/valid/modules.html#memories
//
//     { type memtype }
//
function memIsValid(C, mem) {
  assert(isInstance(C, Context));
  assert(isInstance(mem, Mem));

  // The memory type `memtype` must be valid.
  if (!memTypeIsValid(mem.type)) {
    return false;
  }

  // Then the memory definition is valid with type `memtype`.
  return mem.type;
}

// http://webassembly.github.io/spec/core/valid/modules.html#globals
//
//     { type mut t, init expr }
//
function globalIsValid(C, global) {
  assert(isInstance(C, Context));
  assert(isInstance(global, Global));
  let {type: globaltype, init: expr} = global;
  let {mut, valtype: t} = globaltype;

  // The global type `mut t` must be valid.
  if (!globalTypeIsValid(globaltype)) {
    return false;
  }

  // The expression `expr` must be valid with result type [t].
  let resulttype = new ResultType(t);
  if (!exprIsValidWithResultType(C, expr, resulttype)) {
    return false;
  }

  // The expression `expr` must be constant.
  if (!exprIsConstant(C, expr)) {
    return false;
  }

  // Then the global definition is valid with type `mut t`.
  return globaltype;
}

// http://webassembly.github.io/spec/core/valid/modules.html#element-segments
//
//     { table x, offset expr, init y* }
//
function elemIsValid(C, elem) {
  assert(isInstance(C, Context));
  assert(isInstance(elem, Elem));
  let {table: x, offset: expr, init: y} = elem;

  // The table `C.tables[x]` must be defined in the context.
  if (!C.isTable(x)) {
    return false;
  }

  // Let `limits elemtype` be the table type `C.tables[x]`.
  let {limits, elemtype} = C.getTable(x);

  // The element type `elemtype` must be `anyfunc`.
  if (elemtype != ElemType.anyfunc) {
    return false;
  }

  // The expression `expr` must be valid with result type `[i32]`.
  if (!exprIsValidWithResultType(C, expr, new ResultType(ValType.i32))) {
    return false;
  }

  // The expression `expr` must be constant.
  if (!exprIsConstant(C, expr)) {
    return false;
  }

  // For each `y_i` in `y*`, the function `C.funcs[y_i]` must be defined in
  // the context.
  for (let yi of y) {
    if (!C.isFunc(yi)) {
      return false;
    }
  }

  // Then the element segment is valid.
  return true;
}
