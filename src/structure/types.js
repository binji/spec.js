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

// https://webassembly.github.io/spec/core/syntax/types.html#value-types
//
//     valtype ::= i32 | i64 | f32 | f64
//
class ValType {
  constructor(kind, byteSize) {
    assert(isEnumValue(kind, ValType.kinds));
    this.kind = kind;
    this.isInn = isEnumValue(kind, ValType.innKinds);
    this.isFnn = isEnumValue(kind, ValType.fnnKinds);
    this.byteSize = byteSize;
  }

  toString() {
    return this.kind;
  }
}

ValType.kinds = ['i32', 'i64', 'f32', 'f64'];
ValType.innKinds = ['i32', 'i64'];
ValType.fnnKinds = ['f32', 'f64'];
ValType.i32 = new ValType('i32', 4);
ValType.i64 = new ValType('i64', 8);
ValType.f32 = new ValType('f32', 4);
ValType.f64 = new ValType('f64', 8);

// https://webassembly.github.io/spec/core/syntax/types.html#result-types
//
//     resulttype ::= [valtype?]
//
class ResultType {
  constructor(valtype) {
    assert(isOptionalInstance(valtype, ValType));
    this.resulttype = isUndefined(valtype) ? [] : [valtype];
  }

  equals(other) {
    assert(isInstance(other, ResultType));
    if (this.resulttype.length !== other.resulttype.length) {
      return false;
    }

    if (this.resulttype.length > 0 &&
        this.resulttype[0] !== other.resulttype[0]) {
      return false;
    }

    return true;
  }
}

// https://webassembly.github.io/spec/core/syntax/types.html#function-types
//
//     functype ::= [vec(valtype)] → [vec(valtype)]
//
class FuncType {
  constructor(params, results) {
    assert(isArrayOfInstance(params, ValType));
    assert(isArrayOfInstance(results, ValType));
    this.params = params;
    this.results = results;
  }
}

// https://webassembly.github.io/spec/core/syntax/types.html#limits
//
//     limits ::= {min u32, max u32?}
//
class Limits {
  constructor(min, max) {
    assert(isU32(min));
    assert(isOptional(max, isU32));
    this.min = min;
    this.max = max;
  }
}

// https://webassembly.github.io/spec/core/syntax/types.html#memory-types
//
//     memtype ::= limits
//
class MemType {
  constructor(limits) {
    assert(isInstance(limits, Limits));
    this.limits = limits;
  }
}

// https://webassembly.github.io/spec/core/syntax/types.html#table-types
//
//     tabletype ::= limits elemtype
//
class TableType {
  constructor(limits, elemtype) {
    assert(isInstance(limits, Limits));
    assert(isInstance(elemtype, ElemType));
    this.limits = limits;
    this.elemtype = elemtype;
  }
}

// https://webassembly.github.io/spec/core/syntax/types.html#table-types
//
//     elemtype ::= anyfunc
//
class ElemType {
  constructor(kind) {
    assert(isEnumValue(kind, ElemType.kinds));
    this.kind = kind;
  }

  toString() {
    return this.kind;
  }
}

ElemType.kinds = ['anyfunc'];
ElemType.anyfunc = new ElemType('anyfunc');

// https://webassembly.github.io/spec/core/syntax/types.html#global-types
//
//     globaltype ::= mut valtype
//
class GlobalType {
  constructor(mut, valtype) {
    assert(isInstance(mut, Mut));
    assert(isInstance(valtype, ValType));
    this.mut = mut;
    this.valtype = valtype;
  }
}

// https://webassembly.github.io/spec/core/syntax/types.html#global-types
//
//     mut ::= const | var
//
class Mut {
  constructor(kind) {
    assert(isEnumValue(kind, Mut.kinds));
    this.kind = kind;
  }

  toString() {
    return this.kind;
  }
}

Mut.kinds = ['const', 'var'];
Mut['const'] = new Mut('const');
Mut['var'] = new Mut('var');

// https://webassembly.github.io/spec/core/syntax/types.html#external-types
//
//     externtype ::= func functype | table tabletype
//                  | mem memtype | global globaltype
//
class ExternType {
  constructor(kind, type) {
    assert(isEnumValue(kind, ExternType.kinds));
    switch (kind) {
      case 'func':
        assert(isInstance(type, FuncType));
        break;

      case 'table':
        assert(isInstance(type, TableType));
        break;

      case 'mem':
        assert(isInstance(type, MemType));
        break;

      case 'global':
        assert(isInstance(type, GlobalType));
        break;
    }
    this.kind = kind;
    this.type = type;
  }
}

ExternType.kinds = ['func', 'table', 'mem', 'global'];

// http://webassembly.github.io/spec/core/syntax/types.html#external-types
//
//     funcs(externtype*) = [functype | (func functype) ∈ externtype*]
//
function funcsFromExternTypes(externtypes) {
  assert(isArrayOfInstance(externtypes, ExternType));
  return externtypes.filter(et => et.kind === 'func').map(et => et.type);
}

// http://webassembly.github.io/spec/core/syntax/types.html#external-types
//
//     tables(externtype*) = [tabletype | (table tabletype) ∈ externtype*]
//
function tablesFromExternTypes(externtypes) {
  assert(isArrayOfInstance(externtypes, ExternType));
  return externtypes.filter(et => et.kind === 'table').map(et => et.type);
}

// http://webassembly.github.io/spec/core/syntax/types.html#external-types
//
//     mems(externtype*) = [memtype | (mem memtype) ∈ externtype*]
//
function memsFromExternTypes(externtypes) {
  assert(isArrayOfInstance(externtypes, ExternType));
  return externtypes.filter(et => et.kind === 'mem').map(et => et.type);
}

// http://webassembly.github.io/spec/core/syntax/types.html#external-types
//
//     globals(externtype*) = [globaltype | (global globaltype) ∈ externtype*]
//
function globalsFromExternTypes(externtypes) {
  assert(isArrayOfInstance(externtypes, ExternType));
  return externtypes.filter(et => et.kind === 'global').map(et => et.type);
}
