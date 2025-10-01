import PostmanFileImportVue from "~/components/importExport/ImportExportSteps/PostmanFileImport.vue"
import { defineStep } from "~/composables/step-components"

import { v4 as uuidv4 } from "uuid"
import { Ref } from "vue"

export function PostmanFileSource(metadata: {
  acceptedFileTypes: string
  caption: string
  onImportFromFile: (
    content: string[],
    importScripts: boolean
  ) => any | Promise<any>
  isLoading?: Ref<boolean>
  description?: string
}) {
  const stepID = uuidv4()

  return defineStep(stepID, PostmanFileImportVue, () => ({
    acceptedFileTypes: metadata.acceptedFileTypes,
    caption: metadata.caption,
    onImportFromFile: metadata.onImportFromFile,
    loading: metadata.isLoading?.value,
    description: metadata.description,
  }))
}
