import type { ContractInheritances } from "./types";

export function linearize(graph: ContractInheritances) {
  const linearizations: { [x: string]: any[] } = {};
  const visiting: Set<string> = new Set();
  const heads: string[] = Object.keys(graph);

  for (const head of heads) {
    _linearize(graph, head, linearizations, visiting);
  }

  return linearizations;
}

function _merge(sequences: string[][]): any[] {
  const mergeResult: string[] = [];

  // to avoid modifying the input
  sequences = sequences.map((s) => s.slice());

  while (sequences.length > 0) {
    let found: boolean = false;
    let headCandidate: string;

    for (const seq of sequences) {
      headCandidate = seq[0];

      function cantBeHead(s: string[]) {
        // is a sequence tail
        return s !== seq && s.slice(1).includes(headCandidate);
      }

      if (!sequences.find(cantBeHead)) {
        // if is not in a sequence tail then is head
        found = true;
        mergeResult.push(headCandidate);

        for (const s of sequences) {
          // remove the new head from all the sequences
          const index = s.indexOf(headCandidate);
          if (index > -1) {
            s.splice(index, 1);
          }
        }
        break;
      }
    }

    // clean empty sequences
    sequences = sequences.filter((s) => s.length > 0);

    if (!found) {
      return [
        ...mergeResult,
        "Linearization of inheritance graph impossible",
        ...sequences,
      ];
    }
  }

  return mergeResult;
}

function _linearize(
  graph: { [x: string]: string[] },
  node: string,
  linearizations: { [x: string]: string[] },
  visiting: Set<string>
) {
  // have to linearize and already linearized node
  if (linearizations.hasOwnProperty(node)) {
    return linearizations[node];
  }

  if (visiting.has(node)) {
    return ["Circular dependency found", ...visiting];
  }

  visiting.add(node);

  let parents: string[] = graph[node];

  // the linearization of a node with no parents is the array with the node itself
  if (!parents || parents?.length === 0) {
    const res: string[] = [node];
    linearizations[node] = res;
    return res;
  }

  // solidity c3(right to left) has the opposite of python ordering
  parents = parents.slice().reverse();

  // get the linearization of all node parents
  const sequences: string[][] = parents.map((x: string) =>
    _linearize(graph, x, linearizations, visiting)
  );

  // it should be the merge of the parents linearizations and the parents lists
  sequences.push(parents);

  const mergeResult: any[] = [node].concat(_merge(sequences));
  linearizations[node] = mergeResult;

  visiting.delete(node);

  return mergeResult;
}
