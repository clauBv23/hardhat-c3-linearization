import fsExtra from "fs-extra";

import { task } from "hardhat/config";
import {
  TASK_COMPILE_SOLIDITY_COMPILE_JOB,
  TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
} from "hardhat/builtin-tasks/task-names";
import type { CompilationJob, CompilerInput } from "hardhat/types";

const parser = require("@solidity-parser/parser");

import { linearize } from "./linearize";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";

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
    let { compilationJob } = args;

    let input: CompilerInput = await hre.run(
      TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
      { compilationJob }
    );

    // const { fs } = await import("fs");

    var linearization: LinearizationOutput = {};
    for (const file of Object.entries(input.sources)) {
      var contractName: string;
      var contractInheritances: string[] = [];

      [contractName, contractInheritances] = parsing(file[1].content);

      linearization[contractName] = contractInheritances;
    }
    var result = linearize(linearization, { reverse: true });
    await writeInFile(result);

    return superCall({ ...args, compilationJob });
  }
);

function parsing(contract: string) {
  const ast = parser.parse(contract);
  const contractDefinition = ast.children.find(
    (e: { type: string }) => e.type === "ContractDefinition"
  );
  var inheritances = contractDefinition.baseContracts.map((e: any) => {
    return e.baseName.namePath;
  });

  return [contractDefinition.name, inheritances];
}

function writeInFile(linearization: LinearizationOutput) {
  const fileContent = JSON.stringify(linearization);

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
