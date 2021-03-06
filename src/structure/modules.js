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

// http://webassembly.github.io/spec/core/syntax/modules.html#modules
//
//     module ::= { types vec(functype),
//                  funcs vec(func),
//                  tables vec(table),
//                  mems vec(mem),
//                  globals vec(global),
//                  elem vec(elem),
//                  data vec(data),
//                  start start?,
//                  imports vec(import),
//                  exports vec(export) }
//
class Module {
  constructor({types, funcs, tables, mems, globals, elem, data, start, imports,
               exports}) {
    assert(isArrayOfInstance(types, FuncType));
    assert(isArrayOfInstance(funcs, Func));
    assert(isArrayOfInstance(tables, Table));
    assert(isArrayOfInstance(mems, Mem));
    assert(isArrayOfInstance(globals, Global));
    assert(isArrayOfInstance(elem, Elem));
    assert(isArrayOfInstance(data, Data));
    assert(isOptionalInstance(start, Start));
    assert(isArrayOfInstance(imports, Import));
    assert(isArrayOfInstance(exports, Export));
    this.types = types;
    this.funcs = funcs;
    this.tables = tables;
    this.mems = mems;
    this.globals = globals;
    this.elem = elem;
    this.data = data;
    this.start = start;
    this.imports = imports;
    this.exports = exports;
  }

  toString() {
    return `{
  types [${this.types.join(', ')}],
  funcs [
    ${this.funcs.join(',\n    ')}
  ]
  tables [${this.tables.join(', ')}],
  mems [${this.mems.join(', ')}],
  globals [${this.globals.join(', ')}],
  elem [${this.elem.join(', ')}],
  data [${this.data.join(', ')}],
  start ${this.start ? this.start : 'ϵ'},
  imports ${this.imports.join(', ')},
  exports ${this.exports.join(', ')}
}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#functions
//
//     func ::= { type typeidx, locals vec(valtype), body expr }
//
class Func {
  constructor({type, locals, body}) {
    assert(isIndex(type));
    assert(isArrayOfInstance(locals, ValType));
    assert(isInstance(body, Expr));
    this.type = type;
    this.locals = locals;
    this.body = body;
  }

  toString() {
    return `{type ${this.type}, locals [${this.locals}], body ${this.body}}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#tables
//
//     table ::= { type tabletype }
//
class Table {
  constructor({type}) {
    assert(isInstance(type, TableType));
    this.type = type;
  }

  toString() {
    return `{type ${this.type}}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#memories
//
//     mem ::= { type memtype }
//
class Mem {
  constructor({type}) {
    assert(isInstance(type, MemType));
    this.type = type;
  }

  toString() {
    return `{type ${this.type}}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#globals
//
//     global ::= { type globaltype, init expr }
//
class Global {
  constructor({type, init}) {
    assert(isInstance(type, GlobalType));
    assert(isInstance(init, Expr));
    this.type = type;
    this.init = init;
  }

  toString() {
    return `{type ${this.type}, init ${this.init}}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#elems-segments
//
//     elem ::= { table tableidx, offset expr, init vec(funcidx) }
//
class Elem {
  constructor({table, offset, init}) {
    assert(isIndex(table));
    assert(isInstance(offset, Expr));
    assert(isArrayWithEvery(init, isIndex));
    this.table = table;
    this.offset = offset;
    this.init = init;
  }

  toString() {
    return `{table ${this.table}, offset ${this.offset}, init [${this.init.join(', ')}]}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#data-segments
//
//     data ::= { data memidx, offset expr, init vec(byte) }
//
class Data {
  constructor({data, offset, init}) {
    assert(isIndex(data));
    assert(isInstance(offset, Expr));
    assert(isArrayWithEvery(init, isNumber));
    this.data = data;
    this.offset = offset;
    this.init = init;
  }

  toString() {
    return `{data ${this.data}, offset ${this.offset}, init [${this.init.join(', ')}]}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#start-function
//
//     start ::= { func funcidx }
//
class Start {
  constructor({func}) {
    assert(isIndex(func));
    this.func = func;
  }

  toString() {
    return `{func ${this.func}}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#exports
//
//     export ::= { name name, desc exportdesc }
//
class Export {
  constructor({name, desc}) {
    assert(isString(name));
    assert(isInstance(desc, ExportDesc));
    this.name = name;
    this.desc = desc;
  }

  toString() {
    return `{name ${this.name}, desc ${this.desc}}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#exports
//
//     exportdesc ::= func funcidx | table tableidx
//                  | mem memidx | global globalidx
//
class ExportDesc {
  constructor(kind, idx) {
    assert(isEnumValue(kind, ExternType.kinds));
    assert(isIndex(idx));
    this.kind = kind;
    this.idx = idx;
  }

  toString() {
    return `${this.kind} ${this.idx}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#exports
//
//     funcs(export*) = [funcidx | (func funcidx) ∈ (export.desc)*]
//
function funcsFromExports(exports) {
  assert(isArrayOfInstance(exports, Export));
  return exports.filter(e => e.desc.kind === 'func').map(e => e.desc.idx);
}

// http://webassembly.github.io/spec/core/syntax/modules.html#exports
//
//     tables(export*) = [tableidx | (table tableidx) ∈ (export.desc)*]
//
function tablesFromExports(exports) {
  assert(isArrayOfInstance(exports, Export));
  return exports.filter(e => e.desc.kind === 'table').map(e => e.desc.idx);
}

// http://webassembly.github.io/spec/core/syntax/modules.html#exports
//
//     mems(export*) = [memidx | (mem memidx) ∈ (export.desc)*]
//
function memsFromExports(exports) {
  assert(isArrayOfInstance(exports, Export));
  return exports.filter(e => e.desc.kind === 'mem').map(e => e.desc.idx);
}

// http://webassembly.github.io/spec/core/syntax/modules.html#exports
//
//     globals(export*) = [globalidx | (global globalidx) ∈ (export.desc)*]
//
function globalsFromExports(exports) {
  assert(isArrayOfInstance(exports, Export));
  return exports.filter(e => e.desc.kind === 'global').map(e => e.desc.idx);
}

// http://webassembly.github.io/spec/core/syntax/modules.html#imports
//
//     import ::= { module name, name name, desc importdesc }
//
class Import {
  constructor({module, name, desc}) {
    assert(isString(module));
    assert(isString(name));
    assert(isInstance(desc, ImportDesc));
    this.module = module;
    this.name = name;
    this.desc = desc;
  }

  toString() {
    return `{module ${this.module}, name ${this.name}, desc ${this.desc}}`;
  }
}

// http://webassembly.github.io/spec/core/syntax/modules.html#imports
//
//     importdesc ::= func typeidx | table tabletype
//                  | mem memtype | global globaltype
//
class ImportDesc {
  constructor(kind, value) {
    assert(isEnumValue(kind, ExternType.kinds));
    this.kind = kind;
    switch (kind) {
      case 'func':
        assert(isIndex(value));
        this.typeidx = value;
        break;

      case 'table':
        assert(isInstance(value, TableType));
        this.tabletype = value;
        break;

      case 'mem':
        assert(isInstance(value, MemType));
        this.memtype = value;
        break;

      case 'global':
        assert(isInstance(value, GlobalType));
        this.globaltype = value;
        break;
    }
  }

  toString() {
    switch (this.kind) {
      case 'func':
        return `${this.kind} ${this.typeidx}`;

      case 'table':
        return `${this.kind} ${this.tabletype}`;

      case 'mem':
        return `${this.kind} ${this.memtype}`;

      case 'global':
        return `${this.kind} ${this.globaltype}`;
    }
  }
}
