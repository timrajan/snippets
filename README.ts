async function createAdoTestCase(
    _witClient: IWorkItemTrackingApi,   // unused; kept for signature compatibility
    projectId: string,
    title: string
): Promise<number> {
    const cleanTitle = (title ?? "").trim();
    if (!cleanTitle) throw new Error("Cannot create Test Case: title is empty.");

    const url =
        `${ORG_URL.replace(/\/+$/, "")}` +
        `/${encodeURIComponent(projectId)}` +
        `/_apis/wit/workitems/$${encodeURIComponent(WORK_ITEM_TYPE)}` +
        `?api-version=7.1`;

    const patchDocument = [
        { op: "add", path: "/fields/System.Title", value: cleanTitle },
    ];

    console.log(`[FETCH] POST ${url}`);

    let res: Response;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json-patch+json",
                "Accept": "application/json",
                "Authorization": `Basic ${Buffer.from(`:${PAT}`).toString("base64")}`,
            },
            body: JSON.stringify(patchDocument),
        });
    } catch (err: any) {
        // Network-level failure (DNS, refused, timeout, cert). Surface the cause cleanly.
        const cause = err?.cause?.code || err?.cause?.message || err?.code || err?.message;
        throw new Error(`fetch to ${url} failed: ${cause}`);
    }

    console.log(`[FETCH] HTTP ${res.status}`);
    const text = await res.text();

    if (!res.ok) {
        let detail = text;
        try { detail = JSON.parse(text).message ?? text; } catch {}
        throw new Error(`Test Case creation failed (HTTP ${res.status}): ${detail}`);
    }

    const body = JSON.parse(text);
    if (typeof body.id !== "number") {
        throw new Error(`Unexpected response shape: ${text.substring(0, 300)}`);
    }
    return body.id;
}
