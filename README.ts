const patchDocument: any[] = [
        { op: "add", path: "/fields/System.Title", value: cleanTitle },
        { op: "add", path: "/fields/System.AreaPath",       value: AREA_PATH },
        { op: "add", path: "/fields/System.IterationPath",  value: ITERATION_PATH },
    ];

    if (typeof SHARED_STEP_XML === "string" && SHARED_STEP_XML.trim() !== "") {
        patchDocument.push({
            op: "add",
            path: "/fields/Microsoft.VSTS.TCM.Steps",
            value: SHARED_STEP_XML,
        });
    }
