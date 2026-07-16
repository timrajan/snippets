 const ifFrame = this.global.page as any;
        if (ifFrame && typeof ifFrame.close !== "function" && typeof ifFrame.page === "function") {
            this.global.page = ifFrame.page(); // Frame.page() returns the real Page
        }
