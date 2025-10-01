import { Cookie, HoppRESTRequest } from "@hoppscotch/data"
import { CageModuleCtx, defineSandboxFn } from "faraday-cage/modules"

import { TestResult, BaseInputs } from "~/types"
import {
  getSharedCookieMethods,
  getSharedEnvMethods,
  getSharedRequestProps,
} from "~/utils/shared"
import { createHoppNamespaceMethods } from "../namespaces/hopp-namespace"
import { createPmNamespaceMethods } from "../namespaces/pm-namespace"
import { createPwNamespaceMethods } from "../namespaces/pw-namespace"

type BaseInputsConfig = {
  envs: TestResult["envs"]
  request: HoppRESTRequest
  cookies: Cookie[] | null
  getUpdatedRequest?: () => HoppRESTRequest
}

/**
 * Creates the base input object containing all shared methods across namespaces
 */
export const createBaseInputs = (
  ctx: CageModuleCtx,
  config: BaseInputsConfig
): BaseInputs => {
  // Get environment methods - Applicable to both hopp and pw namespaces
  const { methods: envMethods, updatedEnvs } = getSharedEnvMethods(
    config.envs,
    true
  )

  const { methods: cookieMethods, getUpdatedCookies } = getSharedCookieMethods(
    config.cookies
  )

  // Get request properties - shared across pre and post request contexts
  // For pre-request, use the updater function to read from mutated request
  const requestProps = getSharedRequestProps(
    config.request,
    config.getUpdatedRequest
  )

  // Cookie accessors
  const cookieProps = {
    cookieGet: defineSandboxFn(ctx, "cookieGet", (domain: any, name: any) => {
      return cookieMethods.get(domain, name) || null
    }),
    cookieSet: defineSandboxFn(ctx, "cookieSet", (domain: any, cookie: any) => {
      return cookieMethods.set(domain, cookie)
    }),
    cookieHas: defineSandboxFn(ctx, "cookieHas", (domain: any, name: any) => {
      return cookieMethods.has(domain, name)
    }),
    cookieGetAll: defineSandboxFn(ctx, "cookieGetAll", (domain: any) => {
      return cookieMethods.getAll(domain)
    }),
    cookieDelete: defineSandboxFn(
      ctx,
      "cookieDelete",
      (domain: any, name: any) => {
        return cookieMethods.delete(domain, name)
      }
    ),
    cookieClear: defineSandboxFn(ctx, "cookieClear", (domain: any) => {
      return cookieMethods.clear(domain)
    }),
  }

  // Environment accessors for toObject() support
  const envAccessors = {
    getAllSelectedEnvs: defineSandboxFn(ctx, "getAllSelectedEnvs", () => {
      return updatedEnvs.selected || []
    }),
    getAllGlobalEnvs: defineSandboxFn(ctx, "getAllGlobalEnvs", () => {
      return updatedEnvs.global || []
    }),
  }

  // Combine all namespace methods
  const pwMethods = createPwNamespaceMethods(ctx, envMethods, requestProps)
  const hoppMethods = createHoppNamespaceMethods(ctx, envMethods, requestProps)
  const pmMethods = createPmNamespaceMethods(ctx, config)

  return {
    ...pwMethods,
    ...hoppMethods,
    ...pmMethods,
    ...cookieProps,
    ...envAccessors,
    // Expose the updated state accessors
    getUpdatedEnvs: () => updatedEnvs,
    getUpdatedCookies,
  }
}
