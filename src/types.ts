import type { CompilationJob } from "hardhat/types";

export interface CompileJobArgs {
  compilationJob: CompilationJob;
  compilationJobs: CompilationJob[];
  compilationJobIndex: number;
  quiet: boolean;
  emitsArtifacts: boolean;
}

export interface ContractInheritances {
  [key: string]: string[];
}
