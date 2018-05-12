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
    if (this.opds.length === this.ctrls[0].height &&
        this.ctrls[0].unreachable) {
      return unknown;
    }

    // error_if(opds.size() = ctrls[0].height)
    validationErrorIf(this.opds.length === this.ctrls[0].height,
        'operand stack is empty');

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
    validationErrorIf(actual !== expect, 'actual ≠ expect');

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
  pushCtrl(label, out) {
    assert(isArrayOfInstance(label, ValType));
    assert(isArrayOfInstance(out, ValType));

    // let frame = ctrl_frame(label, out, opds.size(), false)
    let frame = new CtrlFrame(label, out, this.opds.length, false);

    // ctrls.push(frame)
    this.ctrls.unshift(frame);
  }

  // func pop_ctrl() : list(val_type) =
  popCtrl() {
    // error_if(ctrls.is_empty())
    validationErrorIf(this.ctrls.length === 0, 'control stack is empty');

    // let frame = ctrls.pop()
    // N.B. this is a bug in the documented algorithm; the frame cannot be
    // popped here as the top of the `ctrls` stack is accessed in `pop_opd`.
    let frame = this.ctrls[0];

    // pop_opds(frame.end_types)
    this.popOpds(frame.endTypes);

    // error_if(opds.size() =/= frame.height)
    validationErrorIf(this.opds.length !== frame.height,
        'operand stack size ≠ frame height');

    // N.B. frame should be popped here.
    this.ctrls.shift();

    // return frame.end_types
    return frame.endTypes;
  }

  // func unreachable() =
  unreachable() {
    // opds.resize(ctrls[0].height)
    this.opds.length = this.ctrls[0].height;

    // ctrls[0].unreachable := true
    this.ctrls[0].unreachable = true;
  }
}
