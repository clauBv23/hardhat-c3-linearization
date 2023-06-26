import * as parser from "@solidity-parser/parser";
import { ContractDefinition } from "@solidity-parser/parser/dist/src/ast-types";
import fsExtra from "fs-extra";
import {
  TASK_COMPILE_SOLIDITY_COMPILE_JOB,
  TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
} from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import type { CompilerInput } from "hardhat/types";

import type {
  ContractInheritances,
  CompileJobArgs,
  ContractData,
} from "./types";

import { linearize } from "./linearize";
import "./types";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.

task<CompileJobArgs>(
  TASK_COMPILE_SOLIDITY_COMPILE_JOB,
  async (args, hre, superCall) => {
    const { compilationJob } = args;

    const input: CompilerInput = await hre.run(
      TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
      { compilationJob }
    );

    const ctrInheritances: ContractInheritances = {};
    for (const file of Object.entries(input.sources)) {
      const contracts: ContractData[] = parsing(file[1].content);

      for (const c of contracts) {
        ctrInheritances[c.name] = c.inheritances;
      }
    }

    const result = linearize(ctrInheritances);
    writeInFile(result);

    return superCall({ ...args, compilationJob });
  }
);

function parsing(contract: string): ContractData[] {
  const ast = parser.parse(contract);
  let contractDefinitions: ContractDefinition[] = [];

  contractDefinitions = ast.children.filter(
    (e: { type: string }) => e.type === "ContractDefinition"
  ) as ContractDefinition[];

  if (contractDefinitions.length === 0) {
    return [{ name: "", inheritances: [""] }];
  }

  const contracts: ContractData[] = [];

  for (const cd of contractDefinitions) {
    contracts.push({
      name: cd.name,
      inheritances: cd.baseContracts.map((e: any) => {
        return e.baseName.namePath;
      }),
    });
  }
  return contracts;
}

function writeInFile(linearization: ContractInheritances) {
  const fileContent: string = JSON.stringify(linearization, null, 2);

  // todo make file path configurable
  fsExtra.outputFile("linearization/linearization.json", fileContent, (err) => {
    if (err) {
      // todo review how to manage the errors with hardhat
      console.log(err);
    } else {
      // todo
      console.log("File written successfully\n");
    }
  });
}
