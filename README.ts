async teardown() {
    // If page was swapped for a Frame during setup, restore the owning Page
    const maybeFrame = this.global.page as any;
    if (maybeFrame && typeof maybeFrame.close !== "function" && typeof maybeFrame.page === "function") {
        this.global.page = maybeFrame.page(); // Frame.page() returns the real Page
    }

    await super.teardown(); // now the parent's page.close() works
}
