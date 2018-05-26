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

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     sx ::= u | s
//
class Sign {
  constructor(kind) {
    assert(isEnumValue(kind, Sign.kinds));
    this.kind = kind;
  }

  toString() {
    return this.kind;
  }
}

Sign.kinds = ['u', 's'];
Sign.u = new Sign('u');
Sign.s = new Sign('s');

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     instr ::= ...
//
class Instr {
  constructor() {}
}

instrs = new Map();

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
class NumericInstr extends Instr {
  constructor() {
    super();
  }
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     instr ::= inn.const inn | fnn.const fnn
//
class ConstInstr extends NumericInstr {
  constructor(valtype, value) {
    assert(isInstance(valtype, ValType));
    super();
    this.valtype = valtype;
    this.value = value;
  }

  toString() {
    return `${this.valtype}.const ${this.value}`;
  }
}

instrs.set('i32.const', (value) => new ConstInstr(ValType.i32, value));
instrs.set('i64.const', (value) => new ConstInstr(ValType.i64, value));
instrs.set('f32.const', (value) => new ConstInstr(ValType.f32, value));
instrs.set('f64.const', (value) => new ConstInstr(ValType.f64, value));

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     instr ::= inn.iunop | fnn.funop
//
class UnopInstr extends NumericInstr {
  constructor(valtype, kind) {
    assert(isInstance(valtype, ValType));
    assert(isEnumValue(kind, UnopInstr.kinds));
    super();
    this.valtype = valtype;
    this.kind = kind;
  }

  toString() {
    return `${this.valtype}.${this.kind}`;
  }
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     unop ::= iunop | funop
//     iunop ::= clz | ctz | popcnt
//     funop ::= abs | neg | sqrt | ceil | floor | trunc | nearest
//
UnopInstr.kinds = [
  'clz', 'ctz', 'popcnt', 'abs', 'neg', 'sqrt', 'ceil', 'floor', 'trunc',
  'nearest'
];

instrs.set('i32.clz', new UnopInstr(ValType.i32, 'clz'));
instrs.set('i32.ctz', new UnopInstr(ValType.i32, 'ctz'));
instrs.set('i32.popcnt', new UnopInstr(ValType.i32, 'popcnt'));
instrs.set('i64.clz', new UnopInstr(ValType.i64, 'clz'));
instrs.set('i64.ctz', new UnopInstr(ValType.i64, 'ctz'));
instrs.set('i64.popcnt', new UnopInstr(ValType.i64, 'popcnt'));
instrs.set('f32.abs', new UnopInstr(ValType.f32, 'abs'));
instrs.set('f32.neg', new UnopInstr(ValType.f32, 'neg'));
instrs.set('f32.sqrt', new UnopInstr(ValType.f32, 'sqrt'));
instrs.set('f32.ceil', new UnopInstr(ValType.f32, 'ceil'));
instrs.set('f32.floor', new UnopInstr(ValType.f32, 'floor'));
instrs.set('f32.trunc', new UnopInstr(ValType.f32, 'trunc'));
instrs.set('f32.nearest', new UnopInstr(ValType.f32, 'nearest'));
instrs.set('f64.abs', new UnopInstr(ValType.f64, 'abs'));
instrs.set('f64.neg', new UnopInstr(ValType.f64, 'neg'));
instrs.set('f64.sqrt', new UnopInstr(ValType.f64, 'sqrt'));
instrs.set('f64.ceil', new UnopInstr(ValType.f64, 'ceil'));
instrs.set('f64.floor', new UnopInstr(ValType.f64, 'floor'));
instrs.set('f64.trunc', new UnopInstr(ValType.f64, 'trunc'));
instrs.set('f64.nearest', new UnopInstr(ValType.f64, 'nearest'));

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     instr ::= inn.ibinop | fnn.binnop
//     binop ::= ibinop | fbinop
//
class BinopInstr extends NumericInstr {
  constructor(valtype, kind, sign) {
    assert(isInstance(valtype, ValType));
    assert(isEnumValue(kind, BinopInstr.kinds));
    assert(isOptionalInstance(sign, Sign));
    super();
    this.valtype = valtype;
    this.kind = kind;
    this.sign = sign;
  }

  toString() {
    return `${this.valtype}.${this.kind}`;
  }
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     ibinop ::= add | sub | mul | div_sx | rem_sx | and | or | xor | shl
//              | shr_sx | rotl | rotr
//     fbinop ::= add | sub | mul | div | min | max | copysign
//
BinopInstr.kinds = [
  'add', 'sub', 'mul', 'div_s', 'div_u', 'rem_s', 'rem_u', 'and', 'or', 'xor',
  'shl', 'shr_s', 'shr_u', 'rotl', 'rotr', 'div', 'min', 'max', 'copysign'
];

instrs.set('i32.add', new BinopInstr(ValType.i32, 'add'));
instrs.set('i32.sub', new BinopInstr(ValType.i32, 'sub'));
instrs.set('i32.mul', new BinopInstr(ValType.i32, 'mul'));
instrs.set('i32.div_s', new BinopInstr(ValType.i32, 'div_s', Sign.s));
instrs.set('i32.div_u', new BinopInstr(ValType.i32, 'div_u', Sign.u));
instrs.set('i32.rem_s', new BinopInstr(ValType.i32, 'rem_s', Sign.s));
instrs.set('i32.rem_u', new BinopInstr(ValType.i32, 'rem_u', Sign.u));
instrs.set('i32.and', new BinopInstr(ValType.i32, 'and'));
instrs.set('i32.or', new BinopInstr(ValType.i32, 'or'));
instrs.set('i32.xor', new BinopInstr(ValType.i32, 'xor'));
instrs.set('i32.shl', new BinopInstr(ValType.i32, 'shl'));
instrs.set('i32.shr_s', new BinopInstr(ValType.i32, 'shr_s', Sign.s));
instrs.set('i32.shr_u', new BinopInstr(ValType.i32, 'shr_u', Sign.u));
instrs.set('i32.rotl', new BinopInstr(ValType.i32, 'rotl'));
instrs.set('i32.rotr', new BinopInstr(ValType.i32, 'rotr'));
instrs.set('i64.add', new BinopInstr(ValType.i64, 'add'));
instrs.set('i64.sub', new BinopInstr(ValType.i64, 'sub'));
instrs.set('i64.mul', new BinopInstr(ValType.i64, 'mul'));
instrs.set('i64.div_s', new BinopInstr(ValType.i64, 'div_s', Sign.s));
instrs.set('i64.div_u', new BinopInstr(ValType.i64, 'div_u', Sign.u));
instrs.set('i64.rem_s', new BinopInstr(ValType.i64, 'rem_s', Sign.s));
instrs.set('i64.rem_u', new BinopInstr(ValType.i64, 'rem_u', Sign.u));
instrs.set('i64.and', new BinopInstr(ValType.i64, 'and'));
instrs.set('i64.or', new BinopInstr(ValType.i64, 'or'));
instrs.set('i64.xor', new BinopInstr(ValType.i64, 'xor'));
instrs.set('i64.shl', new BinopInstr(ValType.i64, 'shl'));
instrs.set('i64.shr_s', new BinopInstr(ValType.i64, 'shr_s', Sign.s));
instrs.set('i64.shr_u', new BinopInstr(ValType.i64, 'shr_u', Sign.u));
instrs.set('i64.rotl', new BinopInstr(ValType.i64, 'rotl'));
instrs.set('i64.rotr', new BinopInstr(ValType.i64, 'rotr'));
instrs.set('f32.add', new BinopInstr(ValType.f32, 'add'));
instrs.set('f32.sub', new BinopInstr(ValType.f32, 'sub'));
instrs.set('f32.mul', new BinopInstr(ValType.f32, 'mul'));
instrs.set('f32.div', new BinopInstr(ValType.f32, 'div'));
instrs.set('f32.min', new BinopInstr(ValType.f32, 'min'));
instrs.set('f32.max', new BinopInstr(ValType.f32, 'max'));
instrs.set('f32.copysign', new BinopInstr(ValType.f32, 'copysign'));
instrs.set('f64.add', new BinopInstr(ValType.f64, 'add'));
instrs.set('f64.sub', new BinopInstr(ValType.f64, 'sub'));
instrs.set('f64.mul', new BinopInstr(ValType.f64, 'mul'));
instrs.set('f64.div', new BinopInstr(ValType.f64, 'div'));
instrs.set('f64.min', new BinopInstr(ValType.f64, 'min'));
instrs.set('f64.max', new BinopInstr(ValType.f64, 'max'));
instrs.set('f64.copysign', new BinopInstr(ValType.f64, 'copysign'));

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     instr ::= inn.itestop
//     testop ::= itestop
//
class TestopInstr extends NumericInstr {
  constructor(valtype, kind) {
    assert(isInstance(valtype, ValType));
    assert(isEnumValue(kind, TestopInstr.kinds));
    super();
    this.valtype = valtype;
    this.kind = kind;
  }

  toString() {
    return `${this.valtype}.${this.kind}`;
  }
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     itestop ::= eqz
//
TestopInstr.kinds = ['eqz'];

instrs.set('i32.eqz', new TestopInstr(ValType.i32, 'eqz'));
instrs.set('i64.eqz', new TestopInstr(ValType.i64, 'eqz'));

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     instr ::= inn.irelop | fnn.frelop
//     relop ::= irelop | frelop
//
class RelopInstr extends NumericInstr {
  constructor(valtype, kind, sign) {
    assert(isInstance(valtype, ValType));
    assert(isEnumValue(kind, RelopInstr.kinds));
    assert(isOptionalInstance(sign, Sign));
    super();
    this.valtype = valtype;
    this.kind = kind;
  }

  toString() {
    return `${this.valtype}.${this.kind}`;
  }
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     irelop ::= eq | ne | lt_sx | gt_sx | le_sx | ge_sx
//
RelopInstr.kinds = [
  'eq', 'ne', 'lt_s', 'lt_u', 'gt_s', 'gt_u', 'le_s', 'le_u', 'ge_s', 'ge_u',
  'lt', 'gt', 'le', 'ge'
];

instrs.set('i32.eq', new RelopInstr(ValType.i32, 'eq'));
instrs.set('i32.ne', new RelopInstr(ValType.i32, 'ne'));
instrs.set('i32.lt_s', new RelopInstr(ValType.i32, 'lt_s', Sign.s));
instrs.set('i32.lt_u', new RelopInstr(ValType.i32, 'lt_u', Sign.u));
instrs.set('i32.gt_s', new RelopInstr(ValType.i32, 'gt_s', Sign.s));
instrs.set('i32.gt_u', new RelopInstr(ValType.i32, 'gt_u', Sign.u));
instrs.set('i32.le_s', new RelopInstr(ValType.i32, 'le_s', Sign.s));
instrs.set('i32.le_u', new RelopInstr(ValType.i32, 'le_u', Sign.u));
instrs.set('i32.ge_s', new RelopInstr(ValType.i32, 'ge_s', Sign.s));
instrs.set('i32.ge_u', new RelopInstr(ValType.i32, 'ge_u', Sign.u));
instrs.set('i64.eq', new RelopInstr(ValType.i64, 'eq'));
instrs.set('i64.ne', new RelopInstr(ValType.i64, 'ne'));
instrs.set('i64.lt_s', new RelopInstr(ValType.i64, 'lt_s', Sign.s));
instrs.set('i64.lt_u', new RelopInstr(ValType.i64, 'lt_u', Sign.u));
instrs.set('i64.gt_s', new RelopInstr(ValType.i64, 'gt_s', Sign.s));
instrs.set('i64.gt_u', new RelopInstr(ValType.i64, 'gt_u', Sign.u));
instrs.set('i64.le_s', new RelopInstr(ValType.i64, 'le_s', Sign.s));
instrs.set('i64.le_u', new RelopInstr(ValType.i64, 'le_u', Sign.u));
instrs.set('i64.ge_s', new RelopInstr(ValType.i64, 'ge_s', Sign.s));
instrs.set('i64.ge_u', new RelopInstr(ValType.i64, 'ge_u', Sign.u));
instrs.set('f32.eq', new RelopInstr(ValType.f32, 'eq'));
instrs.set('f32.ne', new RelopInstr(ValType.f32, 'ne'));
instrs.set('f32.lt', new RelopInstr(ValType.f32, 'lt'));
instrs.set('f32.gt', new RelopInstr(ValType.f32, 'gt'));
instrs.set('f32.le', new RelopInstr(ValType.f32, 'le'));
instrs.set('f32.ge', new RelopInstr(ValType.f32, 'ge'));
instrs.set('f64.eq', new RelopInstr(ValType.f64, 'eq'));
instrs.set('f64.ne', new RelopInstr(ValType.f64, 'ne'));
instrs.set('f64.lt', new RelopInstr(ValType.f64, 'lt'));
instrs.set('f64.gt', new RelopInstr(ValType.f64, 'gt'));
instrs.set('f64.le', new RelopInstr(ValType.f64, 'le'));
instrs.set('f64.ge', new RelopInstr(ValType.f64, 'ge'));

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     instr ::= i32.wrap/i64 | i64.extend_sx/i32 | inn.trunc_sx/fmm
//             | f32.demote/f64 | f64.promote/f32 | fnn.convert_sx/imm
//             | inn.reinterpret/fnn | fnn.reinterpret/inn
//
class CvtopInstr extends NumericInstr {
  constructor(valtypeDst, kind, valtypeSrc, sign) {
    assert(isInstance(valtypeDst, ValType));
    assert(isEnumValue(kind, CvtopInstr.kinds));
    assert(isInstance(valtypeSrc, ValType));
    assert(isOptionalInstance(sign, Sign));
    super();
    this.valtypeDst = valtypeDst;
    this.kind = kind;
    this.valtypeSrc = valtypeSrc;
    this.sign = sign;
  }

  toString() {
    return `${this.valtypeDst}.${this.kind}/${this.valtypeSrc}`;
  }
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#numeric-instructions
//
//     cvtop ::= wrap | extend_sx | trunc_sx | demote | promote | convert_sx
//             | reinterpret
//
CvtopInstr.kinds = [
  'wrap', 'extend_s', 'extend_u', 'trunc_s', 'trunc_u', 'demote', 'promote',
  'convert_s', 'convert_u', 'reinterpret'
];


instrs.set('i32.wrap/i64', new CvtopInstr(ValType.i32, 'wrap', ValType.i64));
instrs.set('i64.extend_s/i32', new CvtopInstr(ValType.i64, 'extend_s', ValType.i32, Sign.s));
instrs.set('i64.extend_u/i32', new CvtopInstr(ValType.i64, 'extend_u', ValType.i32, Sign.u));
instrs.set('i32.trunc_s/f32', new CvtopInstr(ValType.i32, 'trunc_s', ValType.f32, Sign.s));
instrs.set('i32.trunc_u/f32', new CvtopInstr(ValType.i32, 'trunc_u', ValType.f32, Sign.u));
instrs.set('i32.trunc_s/f64', new CvtopInstr(ValType.i32, 'trunc_s', ValType.f64, Sign.s));
instrs.set('i32.trunc_u/f64', new CvtopInstr(ValType.i32, 'trunc_u', ValType.f64, Sign.u));
instrs.set('i64.trunc_s/f32', new CvtopInstr(ValType.i64, 'trunc_s', ValType.f32, Sign.s));
instrs.set('i64.trunc_u/f32', new CvtopInstr(ValType.i64, 'trunc_u', ValType.f32, Sign.u));
instrs.set('i64.trunc_s/f64', new CvtopInstr(ValType.i64, 'trunc_s', ValType.f64, Sign.s));
instrs.set('i64.trunc_u/f64', new CvtopInstr(ValType.i64, 'trunc_u', ValType.f64, Sign.u));
instrs.set('f32.demote/f64', new CvtopInstr(ValType.f32, 'demote', ValType.f64));
instrs.set('f64.promote/f32', new CvtopInstr(ValType.f64, 'promote', ValType.f32));
instrs.set('f32.convert_s/i32', new CvtopInstr(ValType.f32, 'convert_s', ValType.i32, Sign.s));
instrs.set('f32.convert_u/i32', new CvtopInstr(ValType.f32, 'convert_u', ValType.i32, Sign.u));
instrs.set('f32.convert_s/i64', new CvtopInstr(ValType.f32, 'convert_s', ValType.i64, Sign.s));
instrs.set('f32.convert_u/i64', new CvtopInstr(ValType.f32, 'convert_u', ValType.i64, Sign.u));
instrs.set('f64.convert_s/i32', new CvtopInstr(ValType.f64, 'convert_s', ValType.i32, Sign.s));
instrs.set('f64.convert_u/i32', new CvtopInstr(ValType.f64, 'convert_u', ValType.i32, Sign.u));
instrs.set('f64.convert_s/i64', new CvtopInstr(ValType.f64, 'convert_s', ValType.i64, Sign.s));
instrs.set('f64.convert_u/i64', new CvtopInstr(ValType.f64, 'convert_u', ValType.i64, Sign.u));
instrs.set('i32.reinterpret/f32', new CvtopInstr(ValType.i32, 'reinterpret', ValType.f32));
instrs.set('i64.reinterpret/f64', new CvtopInstr(ValType.i64, 'reinterpret', ValType.f64));
instrs.set('f32.reinterpret/i32', new CvtopInstr(ValType.f32, 'reinterpret', ValType.i32));
instrs.set('f64.reinterpret/i64', new CvtopInstr(ValType.f64, 'reinterpret', ValType.i64));

// https://webassembly.github.io/spec/core/syntax/instructions.html#parametric-instructions
//
//     instr ::= drop | select
//
class ParametricInstr extends Instr {
  constructor(kind) {
    assert(isEnumValue(kind, ParametricInstr.kinds));
    super();
    this.kind = kind;
  }

  toString() {
    return this.kind;
  }
}

ParametricInstr.kinds = ['drop', 'select'];
instrs.set('drop', new ParametricInstr('drop'));
instrs.set('select', new ParametricInstr('select'));

// https://webassembly.github.io/spec/core/syntax/instructions.html#variable-instructions
//
//     instr ::= get_local localidx | set_local localidx | tee_local localidx
//             | get_global globalidx | set_global globalidx
//
class VariableInstr extends Instr {
  constructor(kind, idx) {
    assert(isEnumValue(kind, VariableInstr.kinds));
    super();
    this.kind = kind;
    this.idx = idx;
  }

  toString() {
    return `${this.kind} ${this.idx}`;
  }
}

VariableInstr.kinds =
    ['get_local', 'set_local', 'tee_local', 'get_global', 'set_global'];

instrs.set('get_local', (localidx) => new VariableInstr('get_local', localidx));
instrs.set('set_local', (localidx) => new VariableInstr('set_local', localidx));
instrs.set('tee_local', (localidx) => new VariableInstr('tee_local', localidx));
instrs.set('get_global', (globalidx) => new VariableInstr('get_global', globalidx));
instrs.set('set_global', (globalidx) => new VariableInstr('set_global', globalidx));

// https://webassembly.github.io/spec/core/syntax/instructions.html#memory-instructions
class MemoryInstr extends Instr {
  constructor() {
    super();
  }
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#memory-instructions
//
//     memarg ::= {offset u32, align u32}
//
class MemArg {
  constructor(offset, align) {
    assert(isU32(offset));
    assert(isU32(align));
    this.offset = offset;
    this.align = align;
  }

  toString() {
    return `{offset ${this.offset}, align ${this.align}}`;
  }
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#memory-instructions
//
//     instr ::= inn.load memarg | fnn.load memarg
//             | inn.store memarg | fnn.store memarg
//             | inn.load8_sx memarg | inn.load16_sx memarg | i64.load32_sx memarg
//             | inn.store8 memarg | inn.store16 memarg | i64.store32 memarg
//
class LoadStoreInstr extends MemoryInstr {
  constructor(valtype, kind, storageSize, memarg, sign) {
    assert(isInstance(valtype, ValType));
    assert(isEnumValue(kind, LoadStoreInstr.kinds));
    assert(storageSize <= valtype.byteSize);
    assert(isOptionalInstance(sign, Sign));
    assert(isInstance(memarg, MemArg));
    super();
    this.valtype = valtype;
    this.kind = kind;
    this.storageSize = storageSize;
    this.sign = sign;
    this.memarg = memarg;
  }

  toString() {
    return `${this.valtype}.${this.kind} ${this.memarg}`;
  }
}

LoadStoreInstr.kinds = [
  'load', 'store', 'load8_s', 'load8_u', 'load16_s', 'load16_u', 'load32_s',
  'load32_u', 'store8', 'store16', 'store32'
];

instrs.set('i32.load', (memarg) => new LoadStoreInstr(ValType.i32, 'load', 4, memarg));
instrs.set('i64.load', (memarg) => new LoadStoreInstr(ValType.i64, 'load', 8, memarg));
instrs.set('f32.load', (memarg) => new LoadStoreInstr(ValType.f32, 'load', 4, memarg));
instrs.set('f64.load', (memarg) => new LoadStoreInstr(ValType.f64, 'load', 8, memarg));
instrs.set('i32.load8_s', (memarg) => new LoadStoreInstr(ValType.i32, 'load', 1, memarg, Sign.s));
instrs.set('i32.load8_u', (memarg) => new LoadStoreInstr(ValType.i32, 'load', 1, memarg, Sign.u));
instrs.set('i64.load8_s', (memarg) => new LoadStoreInstr(ValType.i64, 'load', 1, memarg, Sign.s));
instrs.set('i64.load8_u', (memarg) => new LoadStoreInstr(ValType.i64, 'load', 1, memarg, Sign.u));
instrs.set('i32.load16_s', (memarg) => new LoadStoreInstr(ValType.i32, 'load', 2, memarg, Sign.s));
instrs.set('i32.load16_u', (memarg) => new LoadStoreInstr(ValType.i32, 'load', 2, memarg, Sign.u));
instrs.set('i64.load16_s', (memarg) => new LoadStoreInstr(ValType.i64, 'load', 2, memarg, Sign.s));
instrs.set('i64.load16_u', (memarg) => new LoadStoreInstr(ValType.i64, 'load', 2, memarg, Sign.u));
instrs.set('i64.load32_s', (memarg) => new LoadStoreInstr(ValType.i64, 'load', 4, memarg, Sign.s));
instrs.set('i64.load32_u', (memarg) => new LoadStoreInstr(ValType.i64, 'load', 4, memarg, Sign.u));
instrs.set('i32.store8', (memarg) => new LoadStoreInstr(ValType.i32, 'store', 1, memarg));
instrs.set('i64.store8', (memarg) => new LoadStoreInstr(ValType.i64, 'store', 1, memarg));
instrs.set('i32.store16', (memarg) => new LoadStoreInstr(ValType.i32, 'store', 2, memarg));
instrs.set('i64.store16', (memarg) => new LoadStoreInstr(ValType.i64, 'store', 2, memarg));
instrs.set('i64.store32', (memarg) => new LoadStoreInstr(ValType.i64, 'store', 4, memarg));

// https://webassembly.github.io/spec/core/syntax/instructions.html#memory-instructions
//
//     instr ::= memory.size
//             | memory.grow
//
class MemoryPageInstr extends MemoryInstr {
  constructor(kind) {
    super();
    assert(isEnumValue(kind, MemoryPageInstr.kinds));
    this.kind = kind;
  }

  toString() {
    return this.kind;
  }
}

MemoryPageInstr.kinds = ['memory.size', 'memory.grow'];

instrs.set('memory.size', new MemoryPageInstr('memory.size'));
instrs.set('memory.grow', new MemoryPageInstr('memory.grow'));

// https://webassembly.github.io/spec/core/syntax/instructions.html#control-instructions
class ControlInstr extends Instr {
  constructor() {
    super()
  }
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#control-instructions
//
//     instr ::= nop | unreachable | return
//
class BareControlInstr extends ControlInstr {
  constructor(kind) {
    assert(isEnumValue(kind, BareControlInstr.kinds));
    super()
    this.kind = kind;
  }

  toString() {
    return this.kind;
  }
}

BareControlInstr.kinds = ['nop', 'unreachable', 'return'];

instrs.set('nop', new BareControlInstr('nop'));
instrs.set('unreachable', new BareControlInstr('unreachable'));
instrs.set('return', new BareControlInstr('return'));

// https://webassembly.github.io/spec/core/syntax/instructions.html#control-instructions
//
//     instr ::= block resulttype instr* end
//             | loop resulttype instr* end
//             | if resulttype instr* else instr* end
//
class BlockInstr extends ControlInstr {
  constructor(kind, resulttype, instrs) {
    assert(isEnumValue(kind, BlockInstr.kinds));
    assert(isInstance(resulttype, ResultType));
    assert(isArrayOfInstance(instrs, Instr));
    super();
    this.kind = kind;
    this.resulttype = resulttype;
    this.instrs = instrs;
  }

  toString() {
    return `${this.kind} ${this.resulttype} ${this.instrs.join(' ')} end`;
  }
}

BlockInstr.kinds = ['block', 'loop', 'if'];

instrs.set('block', (resulttype, instrs) => new BlockInstr('block', resulttype, instrs));
instrs.set('loop', (resulttype, instrs) => new BlockInstr('loop', resulttype, instrs));

class IfInstr extends BlockInstr {
  constructor(kind, resulttype, instrs1, instrs2) {
    assert(isArrayOfInstance(instrs2, Instr));
    super(kind, resulttype, instrs1);
    this.elseInstrs = instrs2;
  }

  toString() {
    return `${this.kind} ${this.resulttype} ${this.instrs.join(' ')} else ${this.elseInstrs.join(' ')} end`;
  }
}

instrs.set('if', (resulttype, instrs1, instrs2) => new BlockInstr('if', resulttype, instrs1, instrs2));

// https://webassembly.github.io/spec/core/syntax/instructions.html#control-instructions
//
//     instr ::= br labelidx
//             | br_if labelidx
//
class BranchInstr extends ControlInstr {
  constructor(kind, labelidx) {
    assert(isEnumValue(kind, BranchInstr.kinds));
    assert(isIndex(labelidx));
    super();
    this.kind = kind;
    this.labelidx = labelidx;
  }

  toString() {
    return `${this.kind} ${this.labelidx}`;
  }
}

BranchInstr.kinds = ['br', 'br_if', 'br_table'];

instrs.set('br', (labelidx) => new BranchInstr('br', labelidx));
instrs.set('br_if', (labelidx) => new BranchInstr('br_if', labelidx));

// https://webassembly.github.io/spec/core/syntax/instructions.html#control-instructions
//
//     instr ::= br_table vec(labelidx) labelidx
//
class BrTableInstr extends BranchInstr {
  constructor(labelidxs, labelidx) {
    assert(isArrayWithEvery(labelidxs, i => isIndex(i)));
    assert(isIndex(labelidx));
    super('br_table', labelidx);
    this.labelidxs = labelidxs;
  }

  toString() {
    return `${this.kind} [${this.labelidxs.join(' ')}] ${this.labelidx}`;
  }
}

instrs.set('br_table', (labelidxs, labelidx) => new BrTableInstr(labelidxs, labelidx));

class CallInstr extends ControlInstr {
  constructor(kind, idx) {
    assert(isEnumValue(kind, CallInstr.kinds));
    super();
    this.idx = idx;
  }

  toString() {
    return `${this.kind} ${this.idx}`;
  }
}

// https://webassembly.github.io/spec/core/syntax/instructions.html#control-instructions
//
//     instr ::= call funcidx | call_indirect typeidx
//
CallInstr.kinds = ['call', 'call_indirect'];

instrs.set('call', (funcidx) => new CallInstr('call', funcidx));
instrs.set('call_indirect', (typeidx) => new CallInstr('call_indirect', typeidx));

// http://webassembly.github.io/spec/core/syntax/instructions.html#expressions
//
//     expr ::= instr* end
//
class Expr {
  constructor(instrs) {
    assert(isArrayOfInstance(instrs, Instr));
    this.instrs = instrs;
  }

  toString() {
    return `${this.instrs.join(' ')} end`;
  }
}
