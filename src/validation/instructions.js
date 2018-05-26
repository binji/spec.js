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

// http://webassembly.github.io/spec/core/valid/instructions.html#instruction-sequences
// http://webassembly.github.io/spec/core/appendix/algorithm.html#validation-algorithm
function instrSequenceIsValid(C, instrs, label, resulttype) {
  assert(isInstance(C, Context));
  assert(isArrayOfInstance(instrs, Instr));
  assert(isInstance(label, ResultType));
  assert(isInstance(resulttype, ResultType));

  C.pushCtrl(label, resulttype);

  for (let instr of instrs) {
    instrIsValid(C, instr);
  }

  C.popCtrl();
}

// http://webassembly.github.io/spec/core/valid/instructions.html#expressions
function exprIsValid(C, expr, resulttype) {
  assert(isInstance(C, Context));
  assert(isInstance(expr, Expr));
  assert(isInstance(resulttype, ResultType));
  //
  //     instr* end
  //
  // * The instruction sequence `instr*` must be valid with type [] → [t?],
  //   for some optional value type t?.

  // N.B. C.labels is empty when validating a non-function expression (e.g. a
  // data segment initializer). Otherwise it always has one ResultType, which
  // may itself be empty.
  //
  // It is convenient for `instrSequenceIsValid` to take its `label` parameter
  // as a ResultType, so we'll convert an empty `labels` list to a
  // `ResultType`.
  assert(C.labels.length <= 1);

  let label;
  if (C.labels.length === 0) {
    label = new ResultType();
  } else {
    label = C.labels[0];
  }

  instrSequenceIsValid(C, expr.instrs, label, resulttype);
}

function instrIsValid(C, instr) {
  assert(isInstance(C, Context));
  assert(isInstance(instr, Instr));

  if (instr instanceof ConstInstr) {
    return constInstrIsValid(C, instr);
  } else if (instr instanceof UnopInstr) {
    return unopInstrIsValid(C, instr);
  } else if (instr instanceof BinopInstr) {
    return binopInstrIsValid(C, instr);
  } else if (instr instanceof TestopInstr) {
    return testopInstrIsValid(C, instr);
  } else if (instr instanceof RelopInstr) {
    return relopInstrIsValid(C, instr);
  } else if (instr instanceof CvtopInstr) {
    return cvtopInstrIsValid(C, instr);
  } else if (instr instanceof ParametricInstr) {
    switch (instr.kind) {
      case 'drop':
        return dropInstrIsValid(C, instr);

      case 'select':
        return selectInstrIsValid(C, instr);
    }
  } else if (instr instanceof VariableInstr) {
    switch (instr.kind) {
      case 'get_local':
        return getLocalInstrIsValid(C, instr);

      case 'set_local':
        return setLocalInstrIsValid(C, instr);

      case 'tee_local':
        return teeLocalInstrIsValid(C, instr);

      case 'get_global':
        return getGlobalInstrIsValid(C, instr);

      case 'set_global':
        return setGlobalInstrIsValid(C, instr);
    }
  } else if (instr instanceof MemoryInstr) {
    switch (instr.kind) {
      case 'load':
        return loadInstrIsValid(C, instr);

      case 'store':
        return storeInstrIsValid(C, instr);

      case 'memory.size':
        return memorySizeInstrIsValid(C, instr);

      case 'memory.grow':
        return memoryGrowInstrIsValid(C, instr);
    }
  } else if (instr instanceof ControlInstr) {
    switch (instr.kind) {
      case 'nop':
        return nopInstrIsValid(C, instr);

      case 'unreachable':
        return unreachableInstrIsValid(C, instr);

      case 'block':
        return blockInstrIsValid(C, instr);

      case 'loop':
        return loopInstrIsValid(C, instr);

      case 'if':
        return ifInstrIsValid(C, instr);

      case 'br':
        return brInstrIsValid(C, instr);

      case 'br_if':
        return brIfInstrIsValid(C, instr);

      case 'br_table':
        return brTableInstrIsValid(C, instr);

      case 'return':
        return returnInstrIsValid(C, instr);

      case 'call':
        return callInstrIsValid(C, instr);

      case 'call_indirect':
        return callIndirectInstrIsValid(C, instr);
    }
  }

  // Unhandled instr kind.
  assert(false);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-const
function constInstrIsValid(C, instr) {
  //
  //     t.const c
  //
  // * The instruction is valid with type [] → [t].
  let t = instr.valtype;
  C.pushOpd(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-unop
function unopInstrIsValid(C, instr) {
  //
  //     t.unop
  //
  // * The instruction is valid with type [t] → [t].
  let t = instr.valtype;
  C.popOpdExpect(t);
  C.pushOpd(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-binop
function binopInstrIsValid(C, instr) {
  //
  //     t.binop
  //
  // * The instruction is valid with type [t t] → [t].
  let t = instr.valtype;
  C.popOpdExpect(t);
  C.popOpdExpect(t);
  C.pushOpd(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-testop
function testopInstrIsValid(C, instr) {
  //
  //     t.testop
  //
  // * The instruction is valid with type [t] → [i32].
  //
  let t = instr.valtype;
  C.popOpdExpect(t);
  C.pushOpd(ValType.i32);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-relop
function relopInstrIsValid(C, instr) {
  //
  //     t.relop
  //
  // * The instruction is valid with type [t t] → [i32].
  let t = instr.valtype;
  C.popOpdExpect(t);
  C.popOpdExpect(t);
  C.pushOpd(ValType.i32);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-cvtop
function cvtopInstrIsValid(C, instr) {
  //
  //     t₂.cvtop/t₁
  //
  // * The instruction is valid with type [t₁] → [t₂].
  let t_1 = instr.valtypeSrc;
  let t_2 = instr.valtypeDst;
  C.popOpdExpect(t_1);
  C.pushOpd(t_2);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-drop
function dropInstrIsValid(C, instr) {
  //
  //     drop
  //
  // * The instruction is valid with type [t] → [], for any value type t.
  C.popOpd();
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-select
function selectInstrIsValid(C, instr) {
  //
  //     select
  //
  // * The instruction is valid with type [t t i32] → [t], for any value type t.
  C.popOpdExpect(ValType.i32);
  let t_1 = C.popOpd();
  let t_2 = C.popOpdExpect(t_1);
  C.pushOpd(t_2);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-get-local
function getLocalInstrIsValid(C, instr) {
  //
  //     get_local x
  //
  let {idx: x} = instr;

  // * The local `C.locals[x]` must be defined in the context.
  validationErrorUnless(C.isLocal(x),
      `The local C.locals[${x}] must be defined in the context.`);

  // * Let `t` be the value type `C.locals[x]`.
  let t = C.getLocal(x);

  // * Then the instruction is valid with type [] → [t].
  C.pushOpd(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-set-local
function setLocalInstrIsValid(C, instr) {
  //
  //     set_local x
  //
  let {idx: x} = instr;

  // * The local `C.locals[x]` must be defined in the context.
  validationErrorUnless(C.isLocal(x),
      `The local C.locals[${x}] must be defined in the context.`);

  // * Let `t` be the value type `C.locals[x]`.
  let t = C.getLocal(x);

  // * Then the instruction is valid with type [t] → [].
  C.popOpdExpect(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-tee-local
function teeLocalInstrIsValid(C, instr) {
  //
  //     set_local x
  //
  let {idx: x} = instr;

  // * The local `C.locals[x]` must be defined in the context.
  validationErrorUnless(C.isLocal(x),
      `The local C.locals[${x}] must be defined in the context.`);

  // * Let `t` be the value type `C.locals[x]`.
  let t = C.getLocal(x);

  // * Then the instruction is valid with type [t] → [t].
  C.popOpdExpect(t);
  C.pushOpd(t);
}


// http://webassembly.github.io/spec/core/valid/instructions.html#valid-get-global
function getGlobalInstrIsValid(C, instr) {
  //
  //     get_global x
  //
  let {idx: x} = instr;

  // * The global `C.globals[x]` must be defined in the context.
  validationErrorUnless(C.isGlobal(x),
      `The global C.globals[${x}] must be defined in the context.`);

  // * Let `mut t` be the global type `C.globals[x]`.
  let {mut, valtype: t} = C.getGlobal(x);

  // * Then the instruction is valid with type [] → [t].
  C.pushOpd(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-set-global
function setGlobalInstrIsValid(C, instr) {
  //
  //     set_global x
  //
  let {idx: x} = instr;

  // * The global `C.globals[x]` must be defined in the context.
  validationErrorUnless(C.isGlobal(x),
      `The global C.globals[${x}] must be defined in the context.`);

  // * Let `mut t` be the global type `C.globals[x]`.
  let {mut, valtype: t} = C.getGlobal(x);

  // * The mutability mut must be var.
  validationErrorUnless(mut === Mut.var, `The mutability ${mut} must be var.`);

  // * Then the instruction is valid with type [t] → [].
  C.popOpdExpect(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-load
// http://webassembly.github.io/spec/core/valid/instructions.html#valid-loadn
function loadInstrIsValid(C, instr) {
  //
  //     t.load memarg
  //     t.loadN_sx memarg
  //
  let {valtype, storageSize, memarg} = instr;

  // * The memory `C.mems[0]` must be defined in the context.
  validationErrorUnless(C.isMem(x),
      `The memory C.mems[${x}] must be defined in the context.`);

  // * The alignment `2^memarg.align` must not be larger than the bit width of
  //   `t` divided by 8.
  // * The alignment `2^memarg.align` must not be larger than N / 8.
  validationErrorUnless(1 << memarg.align <= storageSize,
      `The alignment ${1 << memarg.align} must not be larger than ${storageSize}.`);

  // * Then the instruction is valid with type [i32] → [t].
  C.popOpdExpect(ValType.i32);
  C.pushOpd(valtype);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-store
// http://webassembly.github.io/spec/core/valid/instructions.html#valid-storen
function storeInstrIsValid(C, instr) {
  //
  //     t.store memarg
  //     t.storeN memarg
  //
  let {valtype, storageSize, memarg} = instr;

  // * The memory `C.mems[0]` must be defined in the context.
  validationErrorUnless(C.isMem(x),
      `The memory C.mems[${x}] must be defined in the context.`);

  // * The alignment `2^memarg.align` must not be larger than the bit width of
  //   `t` divided by 8.
  // * The alignment `2^memarg.align` must not be larger than N / 8.
  validationErrorUnless(1 << memarg.align <= storageSize,
      `The alignment ${1 << memarg.align} must not be larger than ${storageSize}.`);

  // * Then the instruction is valid with type [i32 t] → [].
  C.popOpdExpect(valtype);
  C.popOpdExpect(ValType.i32);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-memory-size
function memorySizeInstrIsValid(C, instr) {
  //
  //     memory.size
  //
  // * The memory `C.mems[0]` must be defined in the context.
  validationErrorUnless(C.isMem(x),
      `The memory C.mems[${x}] must be defined in the context.`);

  // * Then the instruction is valid with type [] → [i32].
  C.pushOpd(ValType.i32);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-memory-grow
function memoryGrowInstrIsValid(C, instr) {
  //
  //     memory.grow
  //
  // * The memory `C.mems[0]` must be defined in the context.
  validationErrorUnless(C.isMem(x),
      `The memory C.mems[${x}] must be defined in the context.`);

  // * Then the instruction is valid with type [i32] → [i32].
  C.popOpdExpect(ValType.i32);
  C.pushOpd(ValType.i32);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-nop
function nopInstrIsValid(C, instr) {
  //
  //     nop
  //
  // * The instruction is valid with type [] → [].
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-unreachable
function unreachableInstrIsValid(C, instr) {
  //
  //     unreachable
  //
  // * The instruction is valid with type [t₁*] → [t₂*], for any sequence of
  //   value types t₁* and t₂*.
  C.unreachable();
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-block
function blockInstrIsValid(C, instr) {
  //
  //     block [t?] instr* end
  //
  let {resulttype: t, instrs} = instr;

  // * Let C' be the same context as C, but with the result type [t?] prepended
  //   to the labels vector.
  // * Under context C', the instruction sequence instr* must be valid with
  //   type [] → [t?].
  instrSequenceIsValid(C, instrs, t, t);

  // * Then the compound instruction is valid with type [] → [t?].
  C.pushOpds(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-loop
function loopInstrIsValid(C, instr) {
  //
  //     loop [t?] instr* end
  //
  let {resulttype: t, instrs} = instr;

  // * Let C' be the same context as C, but with the empty result type []
  //   prepended to the labels vector.
  // * Under context C', the instruction sequence instr* must be valid with
  //   type [] → [t?].
  instrSequenceIsValid(C, instrs, new ResultType(), t);

  // * Then the compound instruction is valid with type [] → [t?].
  C.pushOpds(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-if
function ifInstrIsValid(C, instr) {
  //
  //     if [t?] instr₁* else instr₂* end
  //
  let {resulttype: t, instrs: instrs_1, elseInstrs: instrs_2} = instr;

  C.popOpdExpect(ValType.i32);

  // * Let C' be the same context as C, but with the result type [t?]
  //   prepended to the labels vector.
  // * Under context C', the instruction sequence instr₁* must be valid with
  //   type [] → [t?].
  instrSequenceIsValid(C, instrs_1, t, t);

  // * Under context C', the instruction sequence instr₂* must be valid with
  //   type [] → [t?].
  instrSequenceIsValid(C, instrs_2, t, t);

  // * Then the compound instruction is valid with type [i32] → [t?].
  C.pushOpds(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-br
function brInstrIsValid(C, instr) {
  //
  //     br l
  //
  let {labelidx: l} = instr;

  // * The label `C.labels[l]` must be defined in the context.
  validationErrorUnless(C.isLabel(l),
      `The label C.labels[${l}] must be defined in the context.`);

  // * Let [t?] be the result type `C.labels[l]`.
  let t = C.getLabel(l);

  // * Then the instruction is valid with type [t₁* t?] -> [t₂*], for any
  //   sequence of value types t₁* and t₂*.
  C.popOpds(t);
  C.unreachable();
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-br-if
function brIfInstrIsValid(C, instr) {
  //
  //     br_if l
  //
  let {labelidx: l} = instr;

  // * The label `C.labels[l]` must be defined in the context.
  validationErrorUnless(C.isLabel(l),
      `The label C.labels[${l}] must be defined in the context.`);

  // * Let [t?] be the result type `C.labels[l]`.
  let t = C.getLabel(l);

  // * Then the instruction is valid with type [t? i32] -> [t?].
  C.popOpdExpect(ValType.i32);
  C.popOpds(t);
  C.pushOpds(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-br-table
function brTableInstrIsValid(C, instr) {
  //
  //     br_table l* lₙ
  //
  let {labelidxs: l_star, labelidx: l_n} = instr;

  // * The label `C.labels[lₙ]` must be defined in the context.
  validationErrorUnless(C.isLabel(l_n),
      `The label C.labels[${l_n}] must be defined in the context.`);

  // * Let [t?] be the result type `C.labels[lₙ]`.
  let t = C.getLabel(l_n);

  for (let l_i of l_star) {
    // * For all lᵢ in l*, the label `C.labels[lᵢ]` must be defined in the
    //   context.
    validationErrorUnless(C.isLabel(l_i),
        `The label C.labels[${l_i}] must be defined in the context.`);

    // * For all lᵢ in l*, `C.labels[lᵢ]` must be t?.
    let resultType_i = C.getLabel(l_i);
    validationErrorUnless(resultType_i.equals(t),
        `The label lᵢ (${resultType_i}) must be t? (${t}).`);
  }

  // * Then the instruction is valid with type [t₁* t? i32] -> [t₂*], for any
  //   sequence of value types t₁* and t₂*.
  C.popOpdExpect(ValType.i32);
  C.popOpds(t);
  C.unreachable();
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-return
function returnInstrIsValid(C, instr) {
  //
  //     return
  //
  // * The return type `C.return` must not be absent in the context.
  validationErrorUnless(C.return !== undefined,
      `The return type C.return must not be absent in the context.`);

  // * Let [t?] be the result type of `C.return`.
  let t = C.return;

  // * Then the instruction is valid with type [t₁* t?] -> [t₂*], for any
  //   sequence of value types t₁* and t₂*.
  C.popOpds(t);
  C.unreachable();
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-call
function callInstrIsValid(C, instr) {
  //
  //     call x
  //
  let {idx: x} = instr;

  // * The function `C.funcs[x]` must be defined in the context.
  validationErrorUnless(C.isFunc(x),
      `The function C.func[${x}] must be defined in the context.`);

  // * Then the instruction is valid with type `C.funcs[x]`.
  let ft = C.getFunc(x);
  C.popOpds(ft.results);
  C.pushOpds(ft.params);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-call-indirect
function callIndirectInstrIsValid(C, instr) {
  //
  //     call_indirect x
  //
  let {idx: x} = instr;

  // * The table `C.tables[0]` must be defined in the context.
  validationErrorUnless(C.isTable(0),
      `The table C.table[${0}] must be defined in the context.`);

  // * Let `limits elemtype` be the table type `C.tables[0]`.
  let {limits, elemtype} = C.getTable(0);

  // * The element type `elemtype` must be `anyfunc`.
  validationErrorUnless(elemtype === ElemType.anyfunc,
      `The element type (${elemtype}) must be anyfunc.`);

  // * The type `C.types[x]` must be defined in the context.
  validationErrorUnless(C.isType(x),
      `The type C.type[${x}] must be defined in the context.`);

  // * Let [t₁*] -> [t₂*] be the function type `C.types[x]`.
  let {params: t_1, results: t_2} = C.getType(x);

  // * Then the instruction is valid with type [t₁* i32] -> [t₂*].
  C.popOpdExpect(ValType.i32);
  C.popOpds(t_1);
  C.pushOpds(t_2);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#constant-expressions
function exprIsConstant(C, expr) {
  assert(isInstance(C, Context));
  assert(isInstance(expr, Expr));

  // * In a constant expression `instr* end` all instructions in `instr*` must
  //   be constant.
  for (let instr of expr.instrs) {
    instrIsConstant(C, instr);
  }
}

// http://webassembly.github.io/spec/core/valid/instructions.html#constant-expressions
function instrIsConstant(C, instr) {
  assert(isInstance(C, Context));
  assert(isInstance(instr, Instr));

  // * A constant instruction must be:
  if (instr instanceof ConstInstr) {
    // * either of the form `t.const c`
    return true;
  } else if (instr instanceof VariableInstr && instr.kind === 'get_global') {
    // * or of the form `get_global x`, in which case `C.globals[x]` must be a
    //   global type of the form `const t`.
    let {idx: x} = instr;

    validationErrorUnless(C.isGlobal(x),
        `The global C.globals[${x}] must be defined in the context.`);

    let {mut, valtype: t} = C.getGlobal(x);

    validationErrorUnless(mut === Mut.const,
        `C.globals[${x}] must be a global type of the form 'const t'.`);

    return true;
  } else {
    throw new ValidationError(`A constant instruction must be of the form 't.const c' or 'get_global x'.`);
  }
}
