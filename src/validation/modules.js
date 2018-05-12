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
  let {type: x, locals: t_star, body: expr} = func;

  // * The type `C.types[x]` must be defined in the context.
  validationErrorUnless(C.isType(x),
      `The type C.types[${x}] must be defined in the context`);

  // * Let `[t₁*] → [t₂?]` be the function type `C.types[x]`.
  let functype = C.getType(x);
  let {params: t1, results: [t2]} = functype;

  // * Let C' be the same context as C, but with:
  let resulttype = new ResultType(t2);
  let C_prime = new Context({
    types: C.types,
    funcs: C.funcs,
    tables: C.tables,
    mems: C.mems,
    globals: C.globals,
    // * `locals` set to the sequence of value types `t₁* t*`, concatenating
    //   parameters and locals.
    locals: t1.concat(t_star),
    // * `labels` set to the singular sequence containing only result type
    //   `[t₂?]`.
    labels: [resulttype],
    // * `return` set to the result type `[t₂?]`.
    return: resulttype
  });

  // * Under the Context C', the expression expr must be valid with type `t₂?`.
  exprIsValid(C_prime, expr, resulttype);

  // * Then the function definition is valid with type `[t₁*] → [t₂?]`.
  return functype;
}

// http://webassembly.github.io/spec/core/valid/modules.html#tables
//
//     { type tabletype }
//
function tableIsValid(C, table) {
  assert(isInstance(C, Context));
  assert(isInstance(table, Table));

  // * The table type `tabletype` must be valid.
  tableTypeIsValid(table.type);

  // * Then the table definition is valid with type `tabletype`.
  return table.type;
}

// http://webassembly.github.io/spec/core/valid/modules.html#memories
//
//     { type memtype }
//
function memIsValid(C, mem) {
  assert(isInstance(C, Context));
  assert(isInstance(mem, Mem));

  // * The memory type `memtype` must be valid.
  memTypeIsValid(mem.type);

  // * Then the memory definition is valid with type `memtype`.
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

  // * The global type `mut t` must be valid.
  globalTypeIsValid(globaltype);

  // * The expression `expr` must be valid with result type [t].
  exprIsValid(C, expr, new ResultType(t));

  // * The expression `expr` must be constant.
  exprIsConstant(C, expr);

  // * Then the global definition is valid with type `mut t`.
  return globaltype;
}

// http://webassembly.github.io/spec/core/valid/modules.html#element-segments
//
//     { table x, offset expr, init y* }
//
function elemIsValid(C, elem) {
  assert(isInstance(C, Context));
  assert(isInstance(elem, Elem));
  let {table: x, offset: expr, init: y_star} = elem;

  // * The table `C.tables[x]` must be defined in the context.
  validationErrorUnless(C.isTable(x),
      `The table C.tables[${x}] must be defined in the context`);

  // * Let `limits elemtype` be the table type `C.tables[x]`.
  let {limits, elemtype} = C.getTable(x);

  // * The element type `elemtype` must be `anyfunc`.
  validationErrorUnless(elemtype === ElemType.anyfunc,
      `The element type ${elemtype} must be anyfunc`);

  // * The expression `expr` must be valid with result type `[i32]`.
  exprIsValid(C, expr, new ResultType(ValType.i32));

  // * The expression `expr` must be constant.
  exprIsConstant(C, expr);

  // * For each `yᵢ` in `y*`, the function `C.funcs[yᵢ]` must be defined in
  //   the context.
  for (let y_i of y_star) {
    validationErrorUnless(C.isFunc(y_i),
        `The function C.funcs[${y_i}] must be defined in the context`);
  }

  // * Then the element segment is valid.
  return true;
}

// http://webassembly.github.io/spec/core/valid/modules.html#data-segments
//
//     { data x, offset expr, init b* }
//
function dataIsValid(C, data) {
  assert(isInstance(C, Context));
  assert(isInstance(data, Data));
  let {data: x, offset: expr, init: b_star} = data;

  // * The memory `C.mem[x]` must be defined in the context.
  validationErrorUnless(C.isMem(x),
      `The memory C.mem[${x}] must be defined in the context.`);

  // * The expression `expr` must be valid with result type `[i32]`.
  exprIsValid(C, expr, new ResultType(ValType.i32));

  // * The expression `epxr` must be constant.
  exprIsConstant(C, expr);

  // * Then the data segment is valid.
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

  // * The memory `C.funcs[x]` must be defined in the context.
  validationErrorUnless(C.isFunc(x),
      `The memory C.funcs[${x}] must be defined in the context.`);

  // * The type of `C.funcs[x]` must be `[] → []`.
  let func = C.getFunc(x);
  validationErrorUnless(func.params.length == 0 && funcs.results.length == 0,
      `The type of the start function (C.funcs[${x}]) must be [] → []`);

  // * Then the start function is valid.
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

  // * The export description `exportdesc` must be valid with the external type
  //   `externtype`.
  let v = exportDescIsValid(C, exportdesc);

  // * Then the export is valid with external type `externtype`.
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
      // * The function `C.funcs[x]` must be defined in the context.
      validationErrorUnless(C.isFunc(x),
          `The function C.funcs[${x}] must be defined in the context.`);

      // * Then the export description is valid with external type `func
      //   C.funcs[x]`.
      return new ExternType('func', C.getFunc(x));

    case 'table':
      // * The table `C.tables[x]` must be defined in the context.
      validationErrorUnless(C.isTable(x),
          `The table C.tables[${x}] must be defined in the context.`);

      // * Then the export description is valid with external type `table
      //   C.tables[x]`.
      return new ExternType('table', C.getTable(x));

    case 'mem':
      // * The memory `C.mems[x]` must be defined in the context.
      validationErrorUnless(C.isMem(x),
          `The memory C.mems[${x}] must be defined in the context.`);

      // * Then the export description is valid with external type `mem
      //   C.mems[x]`.
      return new ExternType('mem', C.getMem(x));

    case 'global':
      // * The global `C.globals[x]` must be defined in the context.
      validationErrorUnless(C.isGlobal(x),
          `The global C.globals[${x}] must be defined in the context.`);

      // * Let `mut t` be the global type `C.globals[x]`.
      let globaltype = C.getGlobal(x);
      let {mut, valtype: t} = globaltype;

      // * The mutability `mut` must be `const`.
      validationErrorUnless(mut === Mut.const,
          `The mutability mut (${mut}) must be const.`);

      // * Then the export description is valid with external type `global
      //   C.globals[x]`.
      return new ExternType('global', globaltype);
  }
}

// http://webassembly.github.io/spec/core/valid/modules.html#imports
//
//     { module name1, module name2, desc importdesc }
//
function importIsValid(C, import_) {
  assert(isInstance(C, Context));
  assert(isInstance(import_, Import));
  let {module: name1, name: name2, desc: importdesc} = import_;

  // * The import description `importdesc` must be valid with type `externtype`.
  let v = importDescIsValid(C, importdesc);

  // * Then the import is valid with `externtype`.
  return v;
}

// http://webassembly.github.io/spec/core/valid/modules.html#imports
//
//     { func x }
//     { table tabletype }
//     { mem memtype }
//     { global globaltype }
//
function importDescIsValid(C, importDesc) {
  assert(isInstance(C, Context));
  assert(isInstance(importDesc, ImportDesc));

  switch (importDesc.kind) {
    case 'func':
      let x = importDesc.typeidx;

      // * The function `C.types[x]` must be defined in the context.
      validationErrorUnless(C.isType(x),
          `The function C.types[${x}] must be defined in the context.`);

      // * Let `[t₁*] → [t₂*]` be the function type `C.types[x]`.
      let functype = C.getType(x);

      // * Then the import description is valid with type
      //   `func [t₁*] → [t₂*]`.
      return new ExternType('func', functype);

    case 'table':
      let tabletype = importDesc.tabletype;

      // * The table type `tabletype` must be valid.
      tableTypeIsValid(tabletype);

      // * Then the import description is valid with type table `table
      //   tabletype`.
      return new ExternType('table', tabletype);

    case 'mem':
      let memtype = importDesc.memtype;

      // * The memory `C.mems[x]` must be defined in the context.
      memTypeIsValid(memtype);

      // * Then the import description is valid with type `mem memtype`.
      return new ExternType('mem', memtype);

    case 'global':
      let globaltype = importDesc.globaltype;

      // * The global type `globaltype` must be valid.
      globalTypeIsValid(globaltype);

      // * The mutability of `globaltype` must be `const`.
      validationErrorUnless(globaltype.mut === Mut.const,
          `The mutability of globaltype (${globaltype.mut}) must be const.`);

      // * Then the import description is valid with type `global globaltype`.
      return new ExternType('global', globaltype);
  }
}

// http://webassembly.github.io/spec/core/valid/modules.html#valid-module
function moduleIsValid(module) {
  // * Let `module` be the module to validate.

  // * Let `ft*` be the concatenation of the internal function types `ftᵢ`, in
  //   index order.
  let ft_star = module.funcs.map(f => {
    // N.B. partial reimplementation of funcIsValid.
    validationErrorUnless(f.type < module.types.length,
        `The type C.type[${f.type}] must be defined in the context.`);
    return module.types[f.type];
  });

  // * Let `tt*` be the concatenation of the internal table types `ttᵢ`, in
  //   index order.
  let tt_star = module.tables.map(t => t.type);

  // * Let `mt*` be the concatenation of the internal memory types `mtᵢ`, in
  //   index order.
  let mt_star = module.mems.map(m => m.type);

  // * Let `gt*` be the concatenation of the internal global types `gtᵢ`, in
  //   index order.
  let gt_star = module.globals.map(g => g.type);

  let C0 = new Context({
    types: module.types,
    funcs: [],
    tables: [],
    mems: [],
    globals: [],
    locals: [],
    labels: [],
    return: undefined
  });

  // * Let `it*` be the concatenation of external types `itᵢ` of the imports, in
  //   index order.
  //
  // * For each `importᵢ` in `module.imports`, the segment `importᵢ` must be
  //   valid with an external type `itᵢ`.
  let it_star = module.imports.map(import_i => importIsValid(C0, import_i));

  // * Let C be a context where:
  let C = new Context({
    // * `C.types` is `module.types`,
    types: module.types,
    // * `C.funcs` is `funcs(it*)` concatenated with `ft*`, with the import's
    //   external types `it*` and the internal functiontypes `ft*` as determined
    //   below,
    funcs: funcsFromExternTypes(it_star).concat(ft_star),
    // * `C.tables` is `tables(it*)` concatenated with `tt*`, with the import's
    //   external types `it*` and the internal functiontypes `tt*` as determined
    //   below,
    tables: tablesFromExternTypes(it_star).concat(tt_star),
    // * `C.mems` is `mems(it*)` concatenated with `mt*`, with the import's
    //   external types `it*` and the internal functiontypes `mt*` as determined
    //   below,
    mems: memsFromExternTypes(it_star).concat(mt_star),
    // * `C.globals` is `globals(it*)` concatenated with `gt*`, with the
    //   import's external types `it*` and the internal functiontypes `gt*` as
    //   determined below,
    globals: globalsFromExternTypes(it_star).concat(gt_star),
    // * `C.locals` is empty,
    locals: [],
    // * `C.labels` is empty,
    labels: [],
    // * `C.return` is empty.
    return: undefined,
  });

  // * Let C' be the context where `C'.globals` is the sequence
  //   `globals(externtypeᵢ*)` and all other fields are empty.
  let C_prime = new Context({
    types: [],
    funcs: [],
    tables: [],
    mems: [],
    globals: C.globals,
    locals: [],
    labels: [],
    return: undefined,
  });

  // * Under the context C:

  // * For each `functypeᵢ` in `module.types`, the function type `functypeᵢ`
  //   must be valid.
  for (let functype_i of module.types) {
    funcTypeIsValid(functype_i);
  }

  // * For each `funcᵢ` in `module.funcs`, the definition `funcᵢ` must be valid
  //   with a function type `ftᵢ`.
  for (let [i, func_i] of module.funcs.entries()) {
    let ft_i = funcIsValid(C, func_i);
    validationErrorUnless(ft_i === ft_star[i],
        `The definition funcᵢ must be valid with a function type ftᵢ.`);
  }

  // * For each `tableᵢ` in `module.tables`, the definition `tableᵢ` must be
  //   valid with table type `ttᵢ`.
  for (let [i, table_i] of module.tables.entries()) {
    let tt_i = tableIsValid(C, table_i);
    validationErrorUnless(tt_i === tt_star[i],
        `The definition tableᵢ must be valid with a table type ttᵢ.`);
  }

  // * For each `memᵢ` in `module.mems`, the definition `memᵢ` must be valid
  //   with memory type `mtᵢ`.
  for (let [i, mem_i] of module.mems.entries()) {
    let mt_i = memIsValid(C, mem_i);
    validationErrorUnless(mt_i === mt_star[i],
        `The definition memᵢ must be valid with a memory type mtᵢ.`);
  }

  // * For each `globalᵢ` in `module.globals`:
  //   * Under the context C', the definition globalᵢ must be valid with a
  //     global type gtᵢ.
  for (let [i, global_i] of module.globals.entries()) {
    let gt_i = globalIsValid(C_prime, global_i);
    validationErrorUnless(gt_i === gt_star[i],
        `The definition globalᵢ must be valid with a global type gtᵢ.`);
  }

  // * For each `elemᵢ` in `module.elem`, the segment `elemᵢ` must be valid.
  for (let elem_i of module.elem) {
    elemIsValid(C, elem_i);
  }

  // * For each `dataᵢ` in `module.data`, the segment `dataᵢ` must be valid.
  for (let data_i of module.data) {
    dataIsValid(C, data_i);
  }

  // * If module.start is non-empty, then module.start must be valid.
  if (module.start) {
    startIsValid(module.start);
  }

  // * For each `exportᵢ` in `module.exports`, the segment `exportᵢ` must be
  //   valid with an external type `etᵢ`.
  let et_star = module.exports.map(export_i => exportIsValid(C, export_i));

  // * The length of `C.tables` must not be larger than 1.
  validationErrorUnless(C.tables.length <= 1,
      `The length of C.tables (${C.tables.length}) must not be larger than 1.`);

  // * The length of `C.mems` must not be larger than 1.
  validationErrorUnless(C.mems.length <= 1,
      `The length of C.mems (${C.mems.length}) must not be larger than 1.`);

  // * All export names `exportᵢ.name` must be different.
  validationErrorUnless(
      areDistinct(module.exports.map(export_i => export_i.name)),
      `All export names must be different`);

  // * Then the module is valid with external types `it* → et*`.
  return true;  // TODO: return proper type.
}
