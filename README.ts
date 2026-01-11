export async function getRowByTestID(
    workItemApi: IWorkItemTrackingApi,
    attachment: TestCaseAttachment,
    sheetName: string,
    id: number | string
): Promise<ExcelRow | null> {
