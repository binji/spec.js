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

// http://webassembly.github.io/spec/core/valid/types.html#limits
//
//     { min n, max m? }
//
// * If the maximum `m?` is not empty, then its value must not be smaller than
//   `n`.
// * Then the limit is valid.
//
function limitsIsValid(limits) {
  assert(isInstance(limits, Limits));
  if (isUndefined(limits.max)) {
    return limits.min <= limits.max;
  } else {
    return true;
  }
}

// http://webassembly.github.io/spec/core/valid/types.html#function-types
//
//     [t₁ⁿ] → [t₂ᵐ]
//
// * The arity `m` must not be larger than 1.
// * Then the function type is valid.
//
function funcTypeIsValid(functype) {
  assert(isInstance(functype, FuncType));
  return functype.results.length <= 1;
}

// http://webassembly.github.io/spec/core/valid/types.html#table-types
//
//     limits elemtype
//
// * The limits `limits` must be valid.
// * Then the table type is valid.
//
function tableTypeIsValid(tabletype) {
  assert(isInstance(tabletype, TableType));
  return limitsIsValid(tabletype.limits);
}

// http://webassembly.github.io/spec/core/valid/types.html#memory-types
//
//     limits
//
// * The limits `limits` must be valid.
// * Then the memory type is valid.
//
function memoryTypeIsValid(memtype) {
  assert(isInstance(memtype, MemType));
  return limitsIsValid(memtype.limits);
}

// http://webassembly.github.io/spec/core/valid/types.html#global-types
//
//     mut valtype
//
// * The global type is valid.
//
function globalTypeIsValid(globaltype) {
  assert(isInstance(globaltype, GlobalType));
  return true;
}
