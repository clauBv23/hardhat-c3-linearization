import * as parser from "@solidity-parser/parser";
import { ContractDefinition } from "@solidity-parser/parser/dist/src/ast-types";
import fsExtra from "fs-extra";
import {
  TASK_COMPILE_SOLIDITY_COMPILE_JOB,
  TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
} from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import type { CompilationJob, CompilerInput } from "hardhat/types";

import { linearize } from "./linearize";
import "./type-extensions";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.

// const parser = require("@solidity-parser/parser");

interface CompileJobArgs {
  compilationJob: CompilationJob;
  compilationJobs: CompilationJob[];
  compilationJobIndex: number;
  quiet: boolean;
  emitsArtifacts: boolean;
}

interface LinearizationOutput {
  [key: string]: any;
}

task<CompileJobArgs>(
  TASK_COMPILE_SOLIDITY_COMPILE_JOB,
  async (args, hre, superCall) => {
    const { compilationJob } = args;

    const input: CompilerInput = await hre.run(
      TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
      { compilationJob }
    );

    const linearization: LinearizationOutput = {};
    for (const file of Object.entries(input.sources)) {
      let contractName: string;
      let contractInheritances: string[] = [];

      [contractName, contractInheritances] = parsing(file[1].content);

      linearization[contractName] = contractInheritances;
    }
    const result = linearize(linearization, { reverse: true });
    await writeInFile(result);

    return superCall({ ...args, compilationJob });
  }
);

function parsing(contract: string): [string, string[]] {
  const ast = parser.parse(contract);
  let contractDefinition: ContractDefinition;
  // todo the current approach will return a single contract definition per file
  // todo if there are more than one contract definition in a file only one will be considered
  // todo change this to use filter and parse them all instead of just one.
  contractDefinition = ast.children.find(
    (e: { type: string }) => e.type === "ContractDefinition"
  ) as ContractDefinition;

  if (!contractDefinition) {
    return ["", [""]];
  }

  const inheritances = contractDefinition.baseContracts.map((e: any) => {
    return e.baseName.namePath;
  });

  return [contractDefinition.name, inheritances];
}

function writeInFile(linearization: LinearizationOutput) {
  const fileContent = JSON.stringify(linearization, null, 2);

  fsExtra.outputFile("linearization/linearization.json", fileContent, (err) => {
    if (err) {
      // todo
      console.log(err);
    } else {
      // todo
      console.log("File written successfully\n");
    }
  });
}
