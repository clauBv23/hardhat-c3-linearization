const defaultOptions = {
  reverse: false,
};

export function linearize(graph: any, options: { reverse: boolean }) {
  options = { ...defaultOptions, ...options };

  const results = {};
  const visiting = new Set();
  const heads = Object.keys(graph);

  for (const head of heads) {
    _linearize(graph, head, results, visiting, options);
  }

  return results;
}

function _merge(sequences: any[]) {
  const result = [];
  sequences = sequences.map((s) => s.slice());

  while (sequences.length > 0) {
    let found = false;
    let head: any;

    for (const seq of sequences) {
      head = seq[0];

      function isBadHead(s: string | any[]) {
        return s !== seq && s.slice(1).includes(head);
      }

      if (!sequences.find(isBadHead)) {
        found = true;
        result.push(head);

        for (const seq1 of sequences) {
          const index = seq1.indexOf(head);
          if (index > -1) {
            seq1.splice(index, 1);
          }
        }

        break;
      }
    }

    sequences = sequences.filter((s) => s.length > 0);

    if (!found) {
      return ["Impossible graph inheritance", ...sequences];
    }
  }

  return result;
}
function _linearize(
  graph: { [x: string]: any },
  head: string,
  results: { [x: string]: any[]; hasOwnProperty?: any },
  visiting: Set<unknown>,
  options: { reverse: boolean }
) {
  if (results.hasOwnProperty(head)) {
    return results[head];
  }

  if (visiting.has(head)) {
    return "circular dependency found";
  }
  visiting.add(head);

  let parents = graph[head];

  if (!parents || parents.length === 0) {
    const res = [head];
    results[head] = res;
    return res;
  }

  if (options.reverse === true) {
    parents = parents.slice().reverse();
  }

  const sequences = parents.map((x: any) =>
    _linearize(graph, x, results, visiting, options)
  );
  sequences.push(parents);

  const res1 = [head].concat(_merge(sequences));
  results[head] = res1;

  visiting.delete(head);

  return res1;
}
