const ifFrame = this.global.page as unknown as {
    close?: unknown;
    page?: () => Page;
};
if (ifFrame && typeof ifFrame.close !== "function" && typeof ifFrame.page === "function") {
    this.global.page = ifFrame.page(); // Frame.page() returns the real Page
}
