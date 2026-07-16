/** Structural probe: a Frame masquerading as a Page in this.global.page */
type MaybeFrame = { close?: unknown; page?: () => Page };

const ifFrame = this.global.page as unknown as MaybeFrame;
if (typeof ifFrame?.close !== "function" && typeof ifFrame?.page === "function") {
    this.global.page = ifFrame.page!();
}
