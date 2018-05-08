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

// http://webassembly.github.io/spec/core/valid/modules.html#data-segments
//
//     { data x, offset expr, init b* }
//
function dataIsValid(C, data) {
  assert(isInstance(C, Context));
  assert(isInstance(data, Data));
  let {data: x, offset: expr, init: b} = data;

  // The memory `C.mem[x]` must be defined in the context.
  if (!C.isMem(x)) {
    return false;
  }

  // The expression `expr` must be valid with result type `[i32]`.
  if (!exprIsValidWithResultType(C, expr, new ResultType(ValType.i32))) {
    return false;
  }

  // The expression `epxr` must be constant.
  if (!exprIsConstant(C, expr)) {
    return false;
  }

  // Then the data segment is valid.
  return true;
}

// http://webassembly.github.io/spec/core/valid/modules.html#start-function
//
//     { func x }
//
function startIsValid(C, start) {
  assert(isInstance(C, Context));
  assert(isInstance(start, Start));
  let {func: x} = start;

  // The memory `C.funcs[x]` must be defined in the context.
  if (!C.isFunc(x)) {
    return false;
  }

  // The type of `C.funcs[x]` must be `[] -> []`.
  let func = C.getFunc(x);
  if (!(func.params.length == 0 && funcs.results.length == 0)) {
    return false;
  }

  // Then the start function is valid.
  return true;
}

// http://webassembly.github.io/spec/core/valid/modules.html#exports
//
//     { name name, desc exportdesc }
//
function exportIsValid(C, export_) {
  assert(isInstance(C, Context));
  assert(isInstance(export_, Export));
  let {name, desc: exportdesc} = export_;

  // The export description `exportdesc` must be valid with the external type
  // `externtype`.
  let v = exportDescIsValid(C, exportdesc);
  if (!v) {
    return false;
  }

  // Then the export is valid with external type `externtype`.
  return v;
}

// http://webassembly.github.io/spec/core/valid/modules.html#exports
//
//     { func x }
//     { table x }
//     { mem x }
//     { global x }
//
function exportDescIsValid(C, exportDesc) {
  assert(isInstance(C, Context));
  assert(isInstance(exportDesc, ExportDesc));

  let x = exportDesc.idx;

  switch (exportDesc.kind) {
    case 'func':
      // The function `C.funcs[x]` must be defined in the context.
      if (!C.isFunc(x)) {
        return false;
      }

      // Then the export description is valid with external type `func
      // C.funcs[x]`.
      return new ExternType('func', C.getFunc(x));

    case 'table':
      // The table `C.tables[x]` must be defined in the context.
      if (!C.isTable(x)) {
        return false;
      }

      // Then the export description is valid with external type `table
      // C.tables[x]`.
      return new ExternType('table', C.getTable(x));

    case 'mem':
      // The memory `C.mems[x]` must be defined in the context.
      if (!C.isMem(x)) {
        return false;
      }

      // Then the export description is valid with external type `mem
      // C.mems[x]`.
      return new ExternType('mem', C.getMem(x));

    case 'global':
      // The global `C.globals[x]` must be defined in the context.
      if (!C.isGlobal(x)) {
        return false;
      }

      // Let `mut t` be the global type `C.globals[x]`.
      let globaltype = C.getGlobal(x);
      let {mut, valtype: t} = globaltype;

      // The mutability `mut` must be `const`.
      if (mut != Mut.const) {
        return false;
      }

      // Then the export description is valid with external type `global
      // C.globals[x]`.
      return new ExternType('global', globaltype);
  }
}

// http://webassembly.github.io/spec/core/valid/modules.html#imports
//
//     { module name1, module name2, desc importdesc }
//
function importIsValid(C, import_) {
  assert(isInstance(C, Context));
  assert(isInstance(export_, Export));
  let {module: name1, name: name2, desc: importdesc} = import_;

  // The import description `importdesc` must be valid with type `externtype`.
  let v = importDescIsValid(C, importdesc);
  if (!v) {
    return false;
  }

  // Then the import is valid with `externtype`.
  return v;
}

// http://webassembly.github.io/spec/core/valid/modules.html#exports
//
//     { func x }
//     { table tabletype }
//     { mem memtype }
//     { global globaltype }
//
function exportDescIsValid(C, exportDesc) {
  assert(isInstance(C, Context));
  assert(isInstance(exportDesc, ExportDesc));

  switch (exportDesc.kind) {
    case 'func':
      let x = exportDesc.typeidx;

      // The function `C.types[x]` must be defined in the context.
      if (!C.isType(x)) {
        return false;
      }

      // Let `[t_1^*] -> [t_2^*]` be the function type `C.types[x]`.
      let functype = C.getType(x);

      // Then the import description is valid with type
      // `func [t_1^*] -> [t_2^*]`.
      return new ExternType('func', functype);

    case 'table':
      let tabletype = exportDesc.tabletype;

      // The table type `tabletype` must be valid.
      if (!tableTypeIsValid(tabletype)) {
        return false;
      }

      // Then the import description is valid with type table `table tabletype`.
      return new ExternType('table', tabletype);

    case 'mem':
      let memtype = exportDesc.memtype;

      // The memory `C.mems[x]` must be defined in the context.
      if (!memTypeIsValid(memtype)) {
        return false;
      }

      // Then the import description is valid with type `mem memtype`.
      return new ExternType('mem', memtype);

    case 'global':
      let globaltype = exportDesc.globaltype;

      // The global type `globaltype` must be valid.
      if (!globalTypeIsValid(globaltype)) {
        return false;
      }

      // The mutability of `globaltype` must be `const`.
      if (globaltype.mut != Mut.const) {
        return false;
      }

      // Then the import description is valid with type `global globaltype`.
      return new ExternType('global', globaltype);
  }
}

// http://webassembly.github.io/spec/core/valid/modules.html#valid-module
function moduleIsValid(module) {
  // Let `module` be the module to validate.

  // Let C be a context where:
  let C = new Context({
    // `C.types` is `module.types`,
    types: module.types,
    // `C.funcs` is `funcs(it*)` concatenated with `ft*`, with the import's
    // external types `it*` and the internal functiontypes `ft*` as determined
    // below,
    funcs: funcsFromExternTypes(module.imports),
    // `C.tables` is `tables(it*)` concatenated with `tt*`, with the import's
    // external types `it*` and the internal functiontypes `tt*` as determined
    // below,
    tables: tablesFromExternTypes(module.imports),
    // `C.mems` is `mems(it*)` concatenated with `mt*`, with the import's
    // external types `it*` and the internal functiontypes `mt*` as determined
    // below,
    mems: memsFromExternTypes(module.imports),
    // `C.mems` is `globals(it*)` concatenated with `gt*`, with the import's
    // external types `it*` and the internal functiontypes `gt*` as determined
    // below,
    globals: C.globals,
    // `C.locals` is empty,
    locals: [],
    // `C.labels` is empty,
    labels: [],
    // `C.return` is empty.
    return: undefined,
  });

  // Let C' be the context where `C'.globals` is the sequence
  // `globals(externtype_i^*)` and all other fields are empty.
  let C1 = new Context({
    types: [],
    funcs: [],
    tables: [],
    mems: [],
    globals: C.globals,
    locals: [],
    labels: [],
    return: undefined,
  });

  // Under the context C:

  // For each `functype_i` in `module.types`, the function type `functype_i`
  // must be valid.
  if (!module.types.map(t => funcTypeIsValid(t)).every(x => x)) {
    return false;
  }

  // For each `func_i` in `module.funcs`, the definition `func_i` must be valid
  // with a function type `ft_i`.
  let ft = module.funcs.map(f => funcIsValid(C, f));
  if (ft.some(x => x === false)) {
    return false;
  }
}
