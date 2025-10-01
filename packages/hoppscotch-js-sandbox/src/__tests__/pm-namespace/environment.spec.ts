import { getDefaultRESTRequest } from "@hoppscotch/data"
import * as TE from "fp-ts/TaskEither"
import { pipe } from "fp-ts/function"
import { describe, expect, test } from "vitest"
import { runTestScript } from "~/node"
import { TestResponse, TestResult } from "~/types"

const defaultRequest = getDefaultRESTRequest()
const fakeResponse: TestResponse = {
  status: 200,
  body: "hoi",
  headers: [],
}

const func = (script: string, envs: TestResult["envs"]) =>
  pipe(
    runTestScript(script, {
      envs,
      request: defaultRequest,
      response: fakeResponse,
    }),
    TE.map((x) => x.tests)
  )

describe("pm.environment additional coverage", () => {
  test("pm.environment.set creates and retrieves environment variable", () => {
    return expect(
      func(
        `
          pm.environment.set("test_set", "set_value")
          const retrieved = pm.environment.get("test_set")
          pw.expect(retrieved).toBe("set_value")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'set_value' to be 'set_value'",
          },
        ],
      }),
    ])
  })

  test("pm.environment.has correctly identifies existing and non-existing variables", () => {
    return expect(
      func(
        `
          const hasExisting = pm.environment.has("existing_var")
          const hasNonExisting = pm.environment.has("non_existing_var")
          pw.expect(hasExisting.toString()).toBe("true")
          pw.expect(hasNonExisting.toString()).toBe("false")
        `,
        {
          global: [],
          selected: [
            {
              key: "existing_var",
              currentValue: "existing_value",
              initialValue: "existing_value",
              secret: false,
            },
          ],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'true' to be 'true'",
          },
          {
            status: "pass",
            message: "Expected 'false' to be 'false'",
          },
        ],
      }),
    ])
  })

  test("pm.environment.toObject returns all environment variables set via pm.environment.set", () => {
    return expect(
      func(
        `
          pm.environment.set("key1", "value1")
          pm.environment.set("key2", "value2")
          pm.environment.set("key3", "value3")
          
          const envObj = pm.environment.toObject()
          
          pw.expect(envObj.key1).toBe("value1")
          pw.expect(envObj.key2).toBe("value2")
          pw.expect(envObj.key3).toBe("value3")
          pw.expect(Object.keys(envObj).length.toString()).toBe("3")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'value1' to be 'value1'",
          },
          {
            status: "pass",
            message: "Expected 'value2' to be 'value2'",
          },
          {
            status: "pass",
            message: "Expected 'value3' to be 'value3'",
          },
          {
            status: "pass",
            message: "Expected '3' to be '3'",
          },
        ],
      }),
    ])
  })

  test("pm.environment.toObject returns empty object when no variables are set", () => {
    return expect(
      func(
        `
          const envObj = pm.environment.toObject()
          pw.expect(Object.keys(envObj).length.toString()).toBe("0")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected '0' to be '0'",
          },
        ],
      }),
    ])
  })

  test("pm.environment.clear removes all environment variables set via pm.environment.set", () => {
    return expect(
      func(
        `
          pm.environment.set("key1", "value1")
          pm.environment.set("key2", "value2")
          
          // Verify variables are set
          pw.expect(pm.environment.get("key1")).toBe("value1")
          pw.expect(pm.environment.get("key2")).toBe("value2")
          
          // Clear all
          pm.environment.clear()
          
          // Verify variables are cleared
          pw.expect(pm.environment.get("key1")).toBe(undefined)
          pw.expect(pm.environment.get("key2")).toBe(undefined)
          
          // Verify toObject returns empty
          const envObj = pm.environment.toObject()
          pw.expect(Object.keys(envObj).length.toString()).toBe("0")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'value1' to be 'value1'",
          },
          {
            status: "pass",
            message: "Expected 'value2' to be 'value2'",
          },
          {
            status: "pass",
            message: "Expected 'undefined' to be 'undefined'",
          },
          {
            status: "pass",
            message: "Expected 'undefined' to be 'undefined'",
          },
          {
            status: "pass",
            message: "Expected '0' to be '0'",
          },
        ],
      }),
    ])
  })

  test("pm.environment.unset removes key from tracking", () => {
    return expect(
      func(
        `
          pm.environment.set("key1", "value1")
          pm.environment.set("key2", "value2")
          
          // Unset one key
          pm.environment.unset("key1")
          
          // Verify key1 is removed but key2 remains
          const envObj = pm.environment.toObject()
          pw.expect(envObj.key1).toBe(undefined)
          pw.expect(envObj.key2).toBe("value2")
          pw.expect(Object.keys(envObj).length.toString()).toBe("1")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'undefined' to be 'undefined'",
          },
          {
            status: "pass",
            message: "Expected 'value2' to be 'value2'",
          },
          {
            status: "pass",
            message: "Expected '1' to be '1'",
          },
        ],
      }),
    ])
  })
})

describe("pm.globals additional coverage", () => {
  test("pm.globals.set creates and retrieves global variable", () => {
    return expect(
      func(
        `
          pm.globals.set("test_global", "global_value")
          const retrieved = pm.globals.get("test_global")
          pw.expect(retrieved).toBe("global_value")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'global_value' to be 'global_value'",
          },
        ],
      }),
    ])
  })

  test("pm.globals.toObject returns all global variables set via pm.globals.set", () => {
    return expect(
      func(
        `
          pm.globals.set("globalKey1", "globalValue1")
          pm.globals.set("globalKey2", "globalValue2")
          pm.globals.set("globalKey3", "globalValue3")
          
          const globalObj = pm.globals.toObject()
          
          pw.expect(globalObj.globalKey1).toBe("globalValue1")
          pw.expect(globalObj.globalKey2).toBe("globalValue2")
          pw.expect(globalObj.globalKey3).toBe("globalValue3")
          pw.expect(Object.keys(globalObj).length.toString()).toBe("3")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'globalValue1' to be 'globalValue1'",
          },
          {
            status: "pass",
            message: "Expected 'globalValue2' to be 'globalValue2'",
          },
          {
            status: "pass",
            message: "Expected 'globalValue3' to be 'globalValue3'",
          },
          {
            status: "pass",
            message: "Expected '3' to be '3'",
          },
        ],
      }),
    ])
  })

  test("pm.globals.toObject returns empty object when no globals are set", () => {
    return expect(
      func(
        `
          const globalObj = pm.globals.toObject()
          pw.expect(Object.keys(globalObj).length.toString()).toBe("0")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected '0' to be '0'",
          },
        ],
      }),
    ])
  })

  test("pm.globals.clear removes all global variables set via pm.globals.set", () => {
    return expect(
      func(
        `
          pm.globals.set("globalKey1", "globalValue1")
          pm.globals.set("globalKey2", "globalValue2")
          
          // Verify variables are set
          pw.expect(pm.globals.get("globalKey1")).toBe("globalValue1")
          pw.expect(pm.globals.get("globalKey2")).toBe("globalValue2")
          
          // Clear all
          pm.globals.clear()
          
          // Verify variables are cleared
          pw.expect(pm.globals.get("globalKey1")).toBe(undefined)
          pw.expect(pm.globals.get("globalKey2")).toBe(undefined)
          
          // Verify toObject returns empty
          const globalObj = pm.globals.toObject()
          pw.expect(Object.keys(globalObj).length.toString()).toBe("0")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'globalValue1' to be 'globalValue1'",
          },
          {
            status: "pass",
            message: "Expected 'globalValue2' to be 'globalValue2'",
          },
          {
            status: "pass",
            message: "Expected 'undefined' to be 'undefined'",
          },
          {
            status: "pass",
            message: "Expected 'undefined' to be 'undefined'",
          },
          {
            status: "pass",
            message: "Expected '0' to be '0'",
          },
        ],
      }),
    ])
  })

  test("pm.globals.clear also removes initial global variables from environment", () => {
    return expect(
      func(
        `
          // Verify initial globals exist
          pw.expect(pm.globals.get("initial_global1")).toBe("initial_value1")
          pw.expect(pm.globals.get("initial_global2")).toBe("initial_value2")

          // Add tracked globals
          pm.globals.set("tracked_global", "tracked_value")
          pw.expect(pm.globals.get("tracked_global")).toBe("tracked_value")

          // Verify toObject includes both initial and tracked
          const before = pm.globals.toObject()
          pw.expect(before.initial_global1).toBe("initial_value1")
          pw.expect(before.tracked_global).toBe("tracked_value")

          // Clear all (both initial and tracked)
          pm.globals.clear()

          // Verify ALL globals are cleared
          pw.expect(pm.globals.get("initial_global1")).toBe(undefined)
          pw.expect(pm.globals.get("initial_global2")).toBe(undefined)
          pw.expect(pm.globals.get("tracked_global")).toBe(undefined)

          // Verify toObject returns empty
          const after = pm.globals.toObject()
          pw.expect(Object.keys(after).length.toString()).toBe("0")
        `,
        {
          global: [
            {
              key: "initial_global1",
              currentValue: "initial_value1",
              initialValue: "initial_value1",
              secret: false,
            },
            {
              key: "initial_global2",
              currentValue: "initial_value2",
              initialValue: "initial_value2",
              secret: false,
            },
          ],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'initial_value1' to be 'initial_value1'",
          },
          {
            status: "pass",
            message: "Expected 'initial_value2' to be 'initial_value2'",
          },
          {
            status: "pass",
            message: "Expected 'tracked_value' to be 'tracked_value'",
          },
          {
            status: "pass",
            message: "Expected 'initial_value1' to be 'initial_value1'",
          },
          {
            status: "pass",
            message: "Expected 'tracked_value' to be 'tracked_value'",
          },
          { status: "pass", message: "Expected 'undefined' to be 'undefined'" },
          { status: "pass", message: "Expected 'undefined' to be 'undefined'" },
          { status: "pass", message: "Expected 'undefined' to be 'undefined'" },
          { status: "pass", message: "Expected '0' to be '0'" },
        ],
      }),
    ])
  })

  test("pm.globals.unset removes key from tracking", () => {
    return expect(
      func(
        `
          pm.globals.set("globalKey1", "globalValue1")
          pm.globals.set("globalKey2", "globalValue2")
          
          // Unset one key
          pm.globals.unset("globalKey1")
          
          // Verify key1 is removed but key2 remains
          const globalObj = pm.globals.toObject()
          pw.expect(globalObj.globalKey1).toBe(undefined)
          pw.expect(globalObj.globalKey2).toBe("globalValue2")
          pw.expect(Object.keys(globalObj).length.toString()).toBe("1")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'undefined' to be 'undefined'",
          },
          {
            status: "pass",
            message: "Expected 'globalValue2' to be 'globalValue2'",
          },
          {
            status: "pass",
            message: "Expected '1' to be '1'",
          },
        ],
      }),
    ])
  })
})

describe("pm.variables additional coverage", () => {
  test("pm.variables.set creates and retrieves variable in active environment", () => {
    return expect(
      func(
        `
          pm.variables.set("test_var", "test_value")
          const retrieved = pm.variables.get("test_var")
          pw.expect(retrieved).toBe("test_value")
        `,
        {
          global: [],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'test_value' to be 'test_value'",
          },
        ],
      }),
    ])
  })

  test("pm.variables.has correctly identifies existing and non-existing variables", () => {
    return expect(
      func(
        `
          const hasExisting = pm.variables.has("existing_var")
          const hasNonExisting = pm.variables.has("non_existing_var")
          pw.expect(hasExisting.toString()).toBe("true")
          pw.expect(hasNonExisting.toString()).toBe("false")
        `,
        {
          global: [],
          selected: [
            {
              key: "existing_var",
              currentValue: "existing_value",
              initialValue: "existing_value",
              secret: false,
            },
          ],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'true' to be 'true'",
          },
          {
            status: "pass",
            message: "Expected 'false' to be 'false'",
          },
        ],
      }),
    ])
  })

  test("pm.variables.get returns the correct value from any scope", () => {
    return expect(
      func(
        `
          const data = pm.variables.get("scopedVar")
          pw.expect(data).toBe("scopedValue")
        `,
        {
          global: [
            {
              key: "scopedVar",
              currentValue: "scopedValue",
              initialValue: "scopedValue",
              secret: false,
            },
          ],
          selected: [],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message: "Expected 'scopedValue' to be 'scopedValue'",
          },
        ],
      }),
    ])
  })

  test("pm.variables.replaceIn handles multiple variables", () => {
    return expect(
      func(
        `
          const template = "User {{name}} has {{count}} items in {{location}}"
          const result = pm.variables.replaceIn(template)
          pw.expect(result).toBe("User Alice has 10 items in Cart")
        `,
        {
          global: [
            {
              key: "location",
              currentValue: "Cart",
              initialValue: "Cart",
              secret: false,
            },
          ],
          selected: [
            {
              key: "name",
              currentValue: "Alice",
              initialValue: "Alice",
              secret: false,
            },
            {
              key: "count",
              currentValue: "10",
              initialValue: "10",
              secret: false,
            },
          ],
        }
      )()
    ).resolves.toEqualRight([
      expect.objectContaining({
        expectResults: [
          {
            status: "pass",
            message:
              "Expected 'User Alice has 10 items in Cart' to be 'User Alice has 10 items in Cart'",
          },
        ],
      }),
    ])
  })
})
