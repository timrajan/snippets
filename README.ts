try {
    const probe = await restClient.create(probeUrl, patchDocument, {
        acceptHeader: "application/json",
        additionalHeaders: { "Content-Type": "application/json-patch+json" },
    });
    console.log("[PROBE] statusCode:", probe.statusCode);
    console.log("[PROBE] result:", JSON.stringify(probe.result, null, 2));
} catch (err: any) {
    console.error("[PROBE] threw. Diagnostic dump:");
    console.error("  message:    ", err?.message);
    console.error("  statusCode: ", err?.statusCode);
    console.error("  result:     ", JSON.stringify(err?.result));
    console.error("  body:       ", err?.body);
    console.error("  responseUrl:", err?.responseUrl);
    console.error("  full:");
    console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
}
