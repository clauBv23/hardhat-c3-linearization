import fsExtra from "fs-extra";
import * as parser from "@solidity-parser/parser";
import { ContractDefinition } from "@solidity-parser/parser/dist/src/ast-types";

import { task } from "hardhat/config";
import * as taskTypes from "hardhat/types/builtin-tasks";
import {
  TASK_COMPILE_SOLIDITY_COMPILE_JOB,
  TASK_COMPILE_SOLIDITY_GET_COMPILER_INPUT,
  TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS,
  TASK_COMPILE_SOLIDITY_GET_SOURCE_NAMES,
  TASK_COMPILE_SOLIDITY_GET_DEPENDENCY_GRAPH,
} from "hardhat/builtin-tasks/task-names";
import type { CompilerInput } from "hardhat/types";
import {
  getSolidityFilesCachePath,
  SolidityFilesCache,
} from "hardhat/builtin-tasks/utils/solidity-files-cache";

import type {
  CompileJobArgs,
  ContractData,
  ContractInheritances,
} from "./types";
import { linearize } from "./linearize";

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

task("linearize")
  .addOptionalVariadicPositionalParam(
    "filesPath",
    "An optional list of files to linearize",
    []
  )
  .setAction(
    async (
      { filesPath }: { filesPath: string[] },
      { artifacts, config, run }
    ) => {
      let sourcePaths: string[];
      if (filesPath.length === 0) {
        sourcePaths = await run(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS);
      } else {
        sourcePaths = filesPath;
      }

      const sourceNames: string[] = await run(
        TASK_COMPILE_SOLIDITY_GET_SOURCE_NAMES,
        {
          sourcePaths,
        }
      );

      const solidityFilesCachePath = getSolidityFilesCachePath(config.paths);
      let solidityFilesCache = await SolidityFilesCache.readFromFile(
        solidityFilesCachePath
      );

      const dependencyGraph: taskTypes.DependencyGraph = await run(
        TASK_COMPILE_SOLIDITY_GET_DEPENDENCY_GRAPH,
        { sourceNames, solidityFilesCache }
      );

      const ctrInheritances: ContractInheritances = {};
      for (const file of Object.entries(dependencyGraph.getResolvedFiles())) {
        const contracts: ContractData[] = parsing(file[1].content.rawContent);

        for (const c of contracts) {
          ctrInheritances[c.name] = c.inheritances;
        }
      }

      const result = linearize(ctrInheritances);
      await writeInFile(result);
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

async function writeInFile(linearization: ContractInheritances) {
  const fileContent: string = JSON.stringify(linearization, null, 2);

  // todo make file path configurable
  try {
    await fsExtra.outputFile("linearization/linearization.json", fileContent);
    console.log("Linearization written successfully\n");
  } catch (err) {
    throw new Error(`Error writing on file: ${err}`);
  }
}
