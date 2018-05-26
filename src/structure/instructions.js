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

Instr.I32Const = value => new ConstInstr(ValType.i32, value);
Instr.I64Const = value => new ConstInstr(ValType.i64, value);
Instr.F32Const = value => new ConstInstr(ValType.f32, value);
Instr.F64Const = value => new ConstInstr(ValType.f64, value);

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

Instr.I32Clz = () => new UnopInstr(ValType.i32, 'clz');
Instr.I32Ctz = () => new UnopInstr(ValType.i32, 'ctz');
Instr.I32Popcnt = () => new UnopInstr(ValType.i32, 'popcnt');
Instr.I64Clz = () => new UnopInstr(ValType.i64, 'clz');
Instr.I64Ctz = () => new UnopInstr(ValType.i64, 'ctz');
Instr.I64Popcnt = () => new UnopInstr(ValType.i64, 'popcnt');
Instr.F32Abs = () => new UnopInstr(ValType.f32, 'abs');
Instr.F32Neg = () => new UnopInstr(ValType.f32, 'neg');
Instr.F32Sqrt = () => new UnopInstr(ValType.f32, 'sqrt');
Instr.F32Ceil = () => new UnopInstr(ValType.f32, 'ceil');
Instr.F32Floor = () => new UnopInstr(ValType.f32, 'floor');
Instr.F32Trunc = () => new UnopInstr(ValType.f32, 'trunc');
Instr.F32Nearest = () => new UnopInstr(ValType.f32, 'nearest');
Instr.F64Abs = () => new UnopInstr(ValType.f64, 'abs');
Instr.F64Neg = () => new UnopInstr(ValType.f64, 'neg');
Instr.F64Sqrt = () => new UnopInstr(ValType.f64, 'sqrt');
Instr.F64Ceil = () => new UnopInstr(ValType.f64, 'ceil');
Instr.F64Floor = () => new UnopInstr(ValType.f64, 'floor');
Instr.F64Trunc = () => new UnopInstr(ValType.f64, 'trunc');
Instr.F64Nearest = () => new UnopInstr(ValType.f64, 'nearest');

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

Instr.I32Add = () => new BinopInstr(ValType.i32, 'add');
Instr.I32Sub = () => new BinopInstr(ValType.i32, 'sub');
Instr.I32Mul = () => new BinopInstr(ValType.i32, 'mul');
Instr.I32DivS = () => new BinopInstr(ValType.i32, 'div_s', Sign.s);
Instr.I32DivU = () => new BinopInstr(ValType.i32, 'div_u', Sign.u);
Instr.I32RemS = () => new BinopInstr(ValType.i32, 'rem_s', Sign.s);
Instr.I32RemU = () => new BinopInstr(ValType.i32, 'rem_u', Sign.u);
Instr.I32And = () => new BinopInstr(ValType.i32, 'and');
Instr.I32Or = () => new BinopInstr(ValType.i32, 'or');
Instr.I32Xor = () => new BinopInstr(ValType.i32, 'xor');
Instr.I32Shl = () => new BinopInstr(ValType.i32, 'shl');
Instr.I32ShrS = () => new BinopInstr(ValType.i32, 'shr_s', Sign.s);
Instr.I32ShrU = () => new BinopInstr(ValType.i32, 'shr_u', Sign.u);
Instr.I32Rotl = () => new BinopInstr(ValType.i32, 'rotl');
Instr.I32Rotr = () => new BinopInstr(ValType.i32, 'rotr');
Instr.I64Add = () => new BinopInstr(ValType.i64, 'add');
Instr.I64Sub = () => new BinopInstr(ValType.i64, 'sub');
Instr.I64Mul = () => new BinopInstr(ValType.i64, 'mul');
Instr.I64DivS = () => new BinopInstr(ValType.i64, 'div_s', Sign.s);
Instr.I64DivU = () => new BinopInstr(ValType.i64, 'div_u', Sign.u);
Instr.I64RemS = () => new BinopInstr(ValType.i64, 'rem_s', Sign.s);
Instr.I64RemU = () => new BinopInstr(ValType.i64, 'rem_u', Sign.u);
Instr.I64And = () => new BinopInstr(ValType.i64, 'and');
Instr.I64Or = () => new BinopInstr(ValType.i64, 'or');
Instr.I64Xor = () => new BinopInstr(ValType.i64, 'xor');
Instr.I64Shl = () => new BinopInstr(ValType.i64, 'shl');
Instr.I64ShrS = () => new BinopInstr(ValType.i64, 'shr_s', Sign.s);
Instr.I64ShrU = () => new BinopInstr(ValType.i64, 'shr_u', Sign.u);
Instr.I64Rotl = () => new BinopInstr(ValType.i64, 'rotl');
Instr.I64Rotr = () => new BinopInstr(ValType.i64, 'rotr');
Instr.F32Add = () => new BinopInstr(ValType.f32, 'add');
Instr.F32Sub = () => new BinopInstr(ValType.f32, 'sub');
Instr.F32Mul = () => new BinopInstr(ValType.f32, 'mul');
Instr.F32Div = () => new BinopInstr(ValType.f32, 'div');
Instr.F32Min = () => new BinopInstr(ValType.f32, 'min');
Instr.F32Max = () => new BinopInstr(ValType.f32, 'max');
Instr.F32Copysign = () => new BinopInstr(ValType.f32, 'copysign');
Instr.F64Add = () => new BinopInstr(ValType.f64, 'add');
Instr.F64Sub = () => new BinopInstr(ValType.f64, 'sub');
Instr.F64Mul = () => new BinopInstr(ValType.f64, 'mul');
Instr.F64Div = () => new BinopInstr(ValType.f64, 'div');
Instr.F64Min = () => new BinopInstr(ValType.f64, 'min');
Instr.F64Max = () => new BinopInstr(ValType.f64, 'max');
Instr.F64Copysign = () => new BinopInstr(ValType.f64, 'copysign');

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

Instr.I32Eqz = () => new TestopInstr(ValType.i32, 'eqz');
Instr.I64Eqz = () => new TestopInstr(ValType.i64, 'eqz');

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

Instr.I32Eq = () => new RelopInstr(ValType.i32, 'eq');
Instr.I32Ne = () => new RelopInstr(ValType.i32, 'ne');
Instr.I32LtS = () => new RelopInstr(ValType.i32, 'lt_s', Sign.s);
Instr.I32LtU = () => new RelopInstr(ValType.i32, 'lt_u', Sign.u);
Instr.I32GtS = () => new RelopInstr(ValType.i32, 'gt_s', Sign.s);
Instr.I32GtU = () => new RelopInstr(ValType.i32, 'gt_u', Sign.u);
Instr.I32LeS = () => new RelopInstr(ValType.i32, 'le_s', Sign.s);
Instr.I32LeU = () => new RelopInstr(ValType.i32, 'le_u', Sign.u);
Instr.I32GeS = () => new RelopInstr(ValType.i32, 'ge_s', Sign.s);
Instr.I32GeU = () => new RelopInstr(ValType.i32, 'ge_u', Sign.u);
Instr.I64Eq = () => new RelopInstr(ValType.i64, 'eq');
Instr.I64Ne = () => new RelopInstr(ValType.i64, 'ne');
Instr.I64LtS = () => new RelopInstr(ValType.i64, 'lt_s', Sign.s);
Instr.I64LtU = () => new RelopInstr(ValType.i64, 'lt_u', Sign.u);
Instr.I64GtS = () => new RelopInstr(ValType.i64, 'gt_s', Sign.s);
Instr.I64GtU = () => new RelopInstr(ValType.i64, 'gt_u', Sign.u);
Instr.I64LeS = () => new RelopInstr(ValType.i64, 'le_s', Sign.s);
Instr.I64LeU = () => new RelopInstr(ValType.i64, 'le_u', Sign.u);
Instr.I64GeS = () => new RelopInstr(ValType.i64, 'ge_s', Sign.s);
Instr.I64GeU = () => new RelopInstr(ValType.i64, 'ge_u', Sign.u);
Instr.F32Eq = () => new RelopInstr(ValType.f32, 'eq');
Instr.F32Ne = () => new RelopInstr(ValType.f32, 'ne');
Instr.F32Lt = () => new RelopInstr(ValType.f32, 'lt');
Instr.F32Gt = () => new RelopInstr(ValType.f32, 'gt');
Instr.F32Le = () => new RelopInstr(ValType.f32, 'le');
Instr.F32Ge = () => new RelopInstr(ValType.f32, 'ge');
Instr.F64Eq = () => new RelopInstr(ValType.f64, 'eq');
Instr.F64Ne = () => new RelopInstr(ValType.f64, 'ne');
Instr.F64Lt = () => new RelopInstr(ValType.f64, 'lt');
Instr.F64Gt = () => new RelopInstr(ValType.f64, 'gt');
Instr.F64Le = () => new RelopInstr(ValType.f64, 'le');
Instr.F64Ge = () => new RelopInstr(ValType.f64, 'ge');

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


Instr.I32WrapI64 = () => new CvtopInstr(ValType.i32, 'wrap', ValType.i64);
Instr.I64ExtendSI32 = () => new CvtopInstr(ValType.i64, 'extend_s', ValType.i32, Sign.s);
Instr.I64ExtendUI32 = () => new CvtopInstr(ValType.i64, 'extend_u', ValType.i32, Sign.u);
Instr.I32TruncSF32 = () => new CvtopInstr(ValType.i32, 'trunc_s', ValType.f32, Sign.s);
Instr.I32TruncUF32 = () => new CvtopInstr(ValType.i32, 'trunc_u', ValType.f32, Sign.u);
Instr.I32TruncSF64 = () => new CvtopInstr(ValType.i32, 'trunc_s', ValType.f64, Sign.s);
Instr.I32TruncUF64 = () => new CvtopInstr(ValType.i32, 'trunc_u', ValType.f64, Sign.u);
Instr.I64TruncSF32 = () => new CvtopInstr(ValType.i64, 'trunc_s', ValType.f32, Sign.s);
Instr.I64TruncUF32 = () => new CvtopInstr(ValType.i64, 'trunc_u', ValType.f32, Sign.u);
Instr.I64TruncSF64 = () => new CvtopInstr(ValType.i64, 'trunc_s', ValType.f64, Sign.s);
Instr.I64TruncUF64 = () => new CvtopInstr(ValType.i64, 'trunc_u', ValType.f64, Sign.u);
Instr.F32DemoteF64 = () => new CvtopInstr(ValType.f32, 'demote', ValType.f64);
Instr.F64PromoteF32 = () => new CvtopInstr(ValType.f64, 'promote', ValType.f32);
Instr.F32ConvertSI32 = () => new CvtopInstr(ValType.f32, 'convert_s', ValType.i32, Sign.s);
Instr.F32ConvertUI32 = () => new CvtopInstr(ValType.f32, 'convert_u', ValType.i32, Sign.u);
Instr.F32ConvertSI64 = () => new CvtopInstr(ValType.f32, 'convert_s', ValType.i64, Sign.s);
Instr.F32ConvertUI64 = () => new CvtopInstr(ValType.f32, 'convert_u', ValType.i64, Sign.u);
Instr.F64ConvertSI32 = () => new CvtopInstr(ValType.f64, 'convert_s', ValType.i32, Sign.s);
Instr.F64ConvertUI32 = () => new CvtopInstr(ValType.f64, 'convert_u', ValType.i32, Sign.u);
Instr.F64ConvertSI64 = () => new CvtopInstr(ValType.f64, 'convert_s', ValType.i64, Sign.s);
Instr.F64ConvertUI64 = () => new CvtopInstr(ValType.f64, 'convert_u', ValType.i64, Sign.u);
Instr.I32ReinterpretF32 = () => new CvtopInstr(ValType.i32, 'reinterpret', ValType.f32);
Instr.I64ReinterpretF64 = () => new CvtopInstr(ValType.i64, 'reinterpret', ValType.f64);
Instr.F32ReinterpretI32 = () => new CvtopInstr(ValType.f32, 'reinterpret', ValType.i32);
Instr.F64ReinterpretI64 = () => new CvtopInstr(ValType.f64, 'reinterpret', ValType.i64);

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
Instr.Drop = () => new ParametricInstr('drop');
Instr.Select = () => new ParametricInstr('select');

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

Instr.GetLocal = localidx => new VariableInstr('get_local', localidx);
Instr.SetLocal = localidx => new VariableInstr('set_local', localidx);
Instr.TeeLocal = localidx => new VariableInstr('tee_local', localidx);
Instr.GetGlobal = globalidx => new VariableInstr('get_global', globalidx);
Instr.SetGlobal = globalidx => new VariableInstr('set_global', globalidx);

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

Instr.I32Load = memarg => new LoadStoreInstr(ValType.i32, 'load', 4, memarg);
Instr.I64Load = memarg => new LoadStoreInstr(ValType.i64, 'load', 8, memarg);
Instr.F32Load = memarg => new LoadStoreInstr(ValType.f32, 'load', 4, memarg);
Instr.F64Load = memarg => new LoadStoreInstr(ValType.f64, 'load', 8, memarg);
Instr.I32Load8S = memarg => new LoadStoreInstr(ValType.i32, 'load', 1, memarg, Sign.s);
Instr.I32Load8U = memarg => new LoadStoreInstr(ValType.i32, 'load', 1, memarg, Sign.u);
Instr.I64Load8S = memarg => new LoadStoreInstr(ValType.i64, 'load', 1, memarg, Sign.s);
Instr.I64Load8U = memarg => new LoadStoreInstr(ValType.i64, 'load', 1, memarg, Sign.u);
Instr.I32Load16S = memarg => new LoadStoreInstr(ValType.i32, 'load', 2, memarg, Sign.s);
Instr.I32Load16U = memarg => new LoadStoreInstr(ValType.i32, 'load', 2, memarg, Sign.u);
Instr.I64Load16S = memarg => new LoadStoreInstr(ValType.i64, 'load', 2, memarg, Sign.s);
Instr.I64Load16U = memarg => new LoadStoreInstr(ValType.i64, 'load', 2, memarg, Sign.u);
Instr.I64Load32S = memarg => new LoadStoreInstr(ValType.i64, 'load', 4, memarg, Sign.s);
Instr.I64Load32U = memarg => new LoadStoreInstr(ValType.i64, 'load', 4, memarg, Sign.u);
Instr.I32Store8 = memarg => new LoadStoreInstr(ValType.i32, 'store', 1, memarg);
Instr.I64Store8 = memarg => new LoadStoreInstr(ValType.i64, 'store', 1, memarg);
Instr.I32Store16 = memarg => new LoadStoreInstr(ValType.i32, 'store', 2, memarg);
Instr.I64Store16 = memarg => new LoadStoreInstr(ValType.i64, 'store', 2, memarg);
Instr.I64Store32 = memarg => new LoadStoreInstr(ValType.i64, 'store', 4, memarg);

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

Instr.MemorySize = () => new MemoryPageInstr('memory.size');
Instr.MemoryGrow = () => new MemoryPageInstr('memory.grow');

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

Instr.Nop = () => new BareControlInstr('nop');
Instr.Unreachable = () => new BareControlInstr('unreachable');
Instr.Return = () => new BareControlInstr('return');

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

Instr.Block = (resulttype, instrs) => new BlockInstr('block', resulttype, instrs);
Instr.Loop = (resulttype, instrs) => new BlockInstr('loop', resulttype, instrs);

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

Instr.If = (resulttype, instrs1, instrs2) => new IfInstr('if', resulttype, instrs1, instrs2);

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

Instr.Br = labelidx => new BranchInstr('br', labelidx);
Instr.BrIf = labelidx => new BranchInstr('br_if', labelidx);

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

Instr.BrTable = (labelidxs, labelidx) => new BrTableInstr(labelidxs, labelidx);

// https://webassembly.github.io/spec/core/syntax/instructions.html#control-instructions
//
//     instr ::= call funcidx | call_indirect typeidx
//
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

CallInstr.kinds = ['call', 'call_indirect'];

Instr.Call = funcidx => new CallInstr('call', funcidx);
Instr.CallIndirect = typeidx => new CallInstr('call_indirect', typeidx);

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
