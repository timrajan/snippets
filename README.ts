const restClient: any = (witClient as any).rest;
const probeUrl =
    `_apis/wit/workitems/$${encodeURIComponent(WORK_ITEM_TYPE)}?api-version=7.1`;
const probe = await restClient.create(probeUrl, patchDocument, {
    acceptHeader: "application/json",
    additionalHeaders: { "Content-Type": "application/json-patch+json" },
});
console.log("[PROBE] statusCode:", probe.statusCode);
console.log("[PROBE] result:", JSON.stringify(probe.result));
