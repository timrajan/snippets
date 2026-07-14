 const iframeHandle = await page.$("iframe");
    if (iframeHandle) {
        const frame = await iframeHandle.contentFrame();
        if (frame) page = frame as unknown as Page; // <-- reassigning page to the frame
    }
