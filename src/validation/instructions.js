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

// http://webassembly.github.io/spec/core/appendix/algorithm.html#validation-algorithm
//
// The algorithm uses two separate stacks: the operand stack and the control
// stack. The former tracks the types of operand values on the stack, the
// latter surrounding structured control instructions and their associated
// blocks.

const unknown = undefined;
const isOperand = (x) => isOptionalInstance(x, ValType);

// http://webassembly.github.io/spec/core/appendix/algorithm.html#data-structures
//
//     type ctrl_frame = {
//       label_types : list(val_type)
//       end_types : list(val_type)
//       height : nat
//       unreachable : bool
//     }
//
class CtrlFrame {
  constructor(labelTypes, endTypes, height, unreachable) {
    assert(isArrayOfInstance(labelTypes, ValType));
    assert(isArrayOfInstance(endTypes, ValType));
    assert(isNumber(height));
    assert(isBool(unreachable));

    this.labelTypes = labelTypes;
    this.endTypes = endTypes;
    this.height = height;
    this.unreachable = unreachable;
  }
}

// http://webassembly.github.io/spec/core/appendix/algorithm.html#data-structures
//
//     type val_type = I32 | I64 | F32 | F64
//     type opd_stack = stack(val_type | Unknown)
//     type ctrl_stack = stack(ctrl_frame)
//
class ValidationAlgorithm {
  constructor() {
    this.opds = [];
    this.ctrls = [];
  }

  // func push_opd(type : val_type | Unknown) =
  pushOpd(type) {
    assert(isOperand(type));
    // opds.push(type)
    this.opds.push(type);
  }

  // func pop_opd() : val_type | Unknown =
  popOpd() {
    // if (opds.size() = ctrls[0].height && ctrls[0].unreachable)
    //   return Unknown
    if (this.opds.length === this.ctrls.top().height &&
        this.ctrls.top().unreachable) {
      return unknown;
    }

    // error_if(opds.size() = ctrls[0].height)
    if (this.opds.length === this.ctrls.top().height) {
      throw new Error('operand stack is empty');
    }

    // return opds.pop()
    return this.opds.pop();
  }

  // func pop_opd(expect : val_type | Unknown) : val_type | Unknown =
  popOpdExpect(expect) {
    assert(isOperand(expect));

    // let actual = pop_opd()
    let actual = this.popOpd();

    // if (actual = Unknown) return expect
    if (actual === unknown) {
      return expect;
    }

    // if (expect = Unknown) return actual
    if (expect === unknown) {
      return actual;
    }

    // error_if(actual =/= expect)
    if (actual !== expect) {
      throw new Error('actual != expect');
    }

    // return actual
    return actual;
  }

  // func push_opds(types : list(val_type)) =
  pushOpds(types) {
    assert(isArrayOfInstance(types, ValType));

    // foreach (t in types) push_opd(t)
    for (let t of types) {
      this.pushOpd(t);
    }
  }

  // func pop_opds(types : list(val_type)) =
  popOpds(types) {
    assert(isArrayOfInstance(types, ValType));

    // foreach (t in reverse(types)) pop_opd(t)
    let reversed = types.slice();
    reversed.reverse();

    for (let t of reversed) {
      this.popOpdExpect(t);
    }
  }

  // func push_ctrl(label : list(val_type), out : list(val_type)) =
  pushCtrl(opds, label, out) {
    assert(isArrayOfInstance(label, ValType));
    assert(isArrayOfInstance(out, ValType));

    // let frame = ctrl_frame(label, out, opds.size(), false)
    let frame = new CtrlFrame(label, out, this.opds.length, false);

    // ctrls.push(frame)
    this.ctrls.push(frame);
  }

  // func pop_ctrl() : list(val_type) =
  popCtrl() {
    // error_if(ctrls.is_empty())
    if (this.ctrls.length === 0) {
      throw new Error('control stack is empty');
    }

    // let frame = ctrls.pop()
    let frame = this.ctrls.pop();

    // pop_opds(frame.end_types)
    this.opds.popOpds(frame.endTypes);

    // error_if(opds.size() =/= frame.height)
    if (this.opds.length !== frame.height) {
      throw new Error('operand stack size != frame height');
    }

    // return frame.end_types
    return frame.endTypes;
  }

  // func unreachable() =
  unreachable(opds) {
    // opds.resize(ctrls[0].height)
    this.opds.length = this.ctrls[0].height;

    // ctrls[0].unreachable := true
    this.ctrls[0].unreachable = true;
  }
}

// http://webassembly.github.io/spec/core/valid/instructions.html#expressions
function exprIsValid(C, expr) {
  assert(isInstance(C, Context));
  assert(isInstance(expr, Expr));

  let v = new ValidationAlgorithm();
  //
  //     instr* end
  //
  // * The instruction sequence `instr*` must be valid with type [] → [t?],
  //   for some optional value type t?.
  for (let instr of expr.instrs) {
    instrIsValid(v, instr);
  }

  validationErrorUnless(v.opds.length <= 1,
      `The instruction sequence must be valid with type [] → [t?]`);

  // * Then the expression is valid with result type [t?].
  return new ResultType(v.opds[0]);
}

function instrIsValid(v, instr) {
  if (instr instanceof ConstInstr) {
    constInstrIsValid(v, instr);
  } else if (instr instanceof UnopInstr) {
    unopInstrIsValid(v, instr);
  } else if (instr instanceof BinopInstr) {
    binopInstrIsValid(v, instr);
  } else if (instr instanceof TestopInstr) {
    testopInstrIsValid(v, instr);
  } else if (instr instanceof RelopInstr) {
    relopInstrIsValid(v, instr);
  } else if (instr instanceof CvtopInstr) {
    cvtopInstrIsValid(v, instr);
  } else if (instr instanceof ParametricInstr) {
    switch (instr.kind) {
      case 'drop':
        dropInstrIsValid(v, instr);
        break;

      case 'select':
        selectInstrIsValid(v, instr);
        break;
    }
  } else if (instr instanceof VariableInstr) {
    switch (instr.kind) {
      case 'get_local':
        getLocalInstrIsValid(C, v, instr);
        break;
      case 'set_local':
        setLocalInstrIsValid(C, v, instr);
        break;
      case 'tee_local':
        teeLocalInstrIsValid(C, v, instr);
        break;
      case 'get_global':
        getGlobalInstrIsValid(C, v, instr);
        break;
      case 'set_global':
        setGlobalInstrIsValid(C, v, instr);
        break;
    }
  }

  // Unhandled instr kind.
  assert(false);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-const
function constInstrIsValid(v, instr) {
  //
  //     t.const c
  //
  // * The instruction is valid with type [] → [t].
  let t = instr.valtype;
  v.pushOpd(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-unop
function unopInstrIsValid(v, instr) {
  //
  //     t.unop
  //
  // * The instruction is valid with type [t] → [t].
  let t = instr.valtype;
  v.popOpdExpect(t);
  v.pushOpd(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-binop
function binopInstrIsValid(v, instr) {
  //
  //     t.binop
  //
  // * The instruction is valid with type [t t] → [t].
  let t = instr.valtype;
  v.popOpdExpect(t);
  v.popOpdExpect(t);
  v.pushOpd(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-testop
function testopInstrIsValid(v, instr) {
  //
  //     t.testop
  //
  // * The instruction is valid with type [t] → [i32].
  //
  let t = instr.valtype;
  v.popOpdExpect(t);
  v.pushOpd(ValType.i32);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-relop
function relopInstrIsValid(v, instr) {
  //
  //     t.relop
  //
  // * The instruction is valid with type [t t] → [i32].
  let t = instr.valtype;
  v.popOpdExpect(t);
  v.popOpdExpect(t);
  v.pushOpd(ValType.i32);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-cvtop
function cvtopInstrIsValid(v, instr) {
  //
  //     t₂.cvtop/t₁
  //
  // * The instruction is valid with type [t₁] → [t₂].
  let t_1 = instr.valtypeSrc;
  let t_2 = instr.valtypeDst;
  v.popOpdExpect(t_1);
  v.pushOpd(t_2);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-drop
function dropInstrIsValid(v, instr) {
  //
  //     drop
  //
  // * The instruction is valid with type [t] → [], for any value type t.
  v.popOpd();
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-select
function selectInstrIsValid(v, instr) {
  //
  //     select
  //
  // * The instruction is valid with type [t t i32] → [t], for any value type t.
  v.popOpdExpect(ValType.i32);
  let t_1 = v.popOpd();
  let t_2 = v.popOpdExpect(t_1);
  v.pushOpd(t_2);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-get-local
function getLocalInstrIsValid(C, v, instr) {
  //
  //     get_local x
  //
  // * The local `C.locals[x]` must be defined in the context.
  validationErrorUnless(C.isLocal(x),
      `The local C.locals[${x}] must be defined in the context.`);

  // * Let `t` be the value type `C.locals[x]`.
  let t = C.getLocal(x);

  // * Then the instruction is valid with type [] → [t].
  v.pushOpd(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-set-local
function setLocalInstrIsValid(C, v, instr) {
  //
  //     set_local x
  //
  // * The local `C.locals[x]` must be defined in the context.
  validationErrorUnless(C.isLocal(x),
      `The local C.locals[${x}] must be defined in the context.`);

  // * Let `t` be the value type `C.locals[x]`.
  let t = C.getLocal(x);

  // * Then the instruction is valid with type [t] → [].
  v.popOpdExpect(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-tee-local
function teeLocalInstrIsValid(C, v, instr) {
  //
  //     set_local x
  //
  // * The local `C.locals[x]` must be defined in the context.
  validationErrorUnless(C.isLocal(x),
      `The local C.locals[${x}] must be defined in the context.`);

  // * Let `t` be the value type `C.locals[x]`.
  let t = C.getLocal(x);

  // * Then the instruction is valid with type [t] → [t].
  v.popOpdExpect(t);
  v.pushOpd(t);
}


// http://webassembly.github.io/spec/core/valid/instructions.html#valid-get-global
function getGlobalInstrIsValid(C, v, instr) {
  //
  //     get_global x
  //
  // * The global `C.globals[x]` must be defined in the context.
  validationErrorUnless(C.isGlobal(x),
      `The global C.globals[${x}] must be defined in the context.`);

  // * Let `mut t` be the global type `C.globals[x]`.
  let {mut, valtype: t} = C.getGlobal(x);

  // * Then the instruction is valid with type [] → [t].
  v.pushOpd(t);
}

// http://webassembly.github.io/spec/core/valid/instructions.html#valid-set-global
function setGlobalInstrIsValid(C, v, instr) {
  //
  //     set_global x
  //
  // * The global `C.globals[x]` must be defined in the context.
  validationErrorUnless(C.isGlobal(x),
      `The global C.globals[${x}] must be defined in the context.`);

  // * Let `mut t` be the global type `C.globals[x]`.
  let {mut, valtype: t} = C.getGlobal(x);

  // * The mutability mut must be var.
  validationErrorUnless(mut === Mut.var, `The mutability ${mut} must be var.`);

  // * Then the instruction is valid with type [t] → [].
  v.popOpdExpect(t);
}

function exprIsValidWithResultType(C, expr, resulttype) {
  let v = exprIsValid(C, expr);
  validationErrorUnless(v.equals(resulttype),
      `The expression must be valid with result type ${resulttype} (got ${v.resulttype})`);
  return true;
}

function exprIsConstant(C, expr) {
  // TODO
  validationErrorUnless(false, `TODO`);
}
