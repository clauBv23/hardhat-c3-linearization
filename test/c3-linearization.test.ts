const assert = require("assert");
const { linearize } = require("../src/linearize");

describe("Unit tests", function () {
  describe("C3-linearization", function () {
    it("linearizes trivial case", function () {
      assert.deepEqual(linearize({ A: [] }), { A: ["A"] });
    });

    it("linearizes single inheritance case", function () {
      assert.deepEqual(linearize({ A: ["B"], B: ["C"], C: [] }), {
        A: ["A", "B", "C"],
        B: ["B", "C"],
        C: ["C"],
      });
    });

    it("linearizes multiple inheritance case", function () {
      assert.deepEqual(
        linearize({
          A: [],
          B: [],
          C: [],
          D: [],
          E: [],
          K1: ["A", "B", "C"],
          K2: ["D", "B", "E"],
          K3: ["D", "A"],
          Z: ["K1", "K2", "K3"],
        }),
        {
          A: ["A"],
          B: ["B"],
          C: ["C"],
          D: ["D"],
          E: ["E"],
          K1: ["K1", "C", "B", "A"],
          K2: ["K2", "E", "B", "D"],
          K3: ["K3", "A", "D"],
          Z: ["Z", "K3", "K2", "E", "K1", "C", "B", "A", "D"],
        }
      );
    });

    it("reports linearization of graph impossible correctly", function () {
      const impossibleLinearizationMessage =
        "Linearization of inheritance graph impossible";

      assert.deepEqual(linearize({ A: [], B: ["A"], C: ["B", "A"] }), {
        A: ["A"],
        B: ["B", "A"],
        C: ["C", impossibleLinearizationMessage, ["A"], ["B", "A"], ["A", "B"]],
      });
    });

    it("reports circular dependencies correctly", function () {
      const circularDependency = ["Circular dependency found", "A", "B", "C"];

      assert.deepEqual(
        linearize({ A: ["B"], B: ["C"], C: ["B"], D: ["E"], E: [] }),
        {
          A: ["A", "B", "C", ...circularDependency],
          B: ["B", "C", ...circularDependency],
          C: ["C", ...circularDependency],
          D: ["D", "E"],
          E: ["E"],
        }
      );
    });
  });

  // todo

  describe.skip("parse function", function () {});

  describe.skip("write in file", function () {});
});
