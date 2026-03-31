<style>
    .status-new {
        color: blue;
        font-weight: bold;
    }
    .status-action {
        color: green;
    }
    .status-failed {
        color: red;
        font-weight: bold;
    }
</style>


    <table>
    <thead>
        <tr>
            <th>Status</th>
            <!-- your other columns -->
        </tr>
    </thead>
    <tbody>
        @foreach (var item in ViewBag.Results)
        {
            <tr>
                <td class="@(item.Status == "new" ? "status-new" : 
                             item.Status == "action" ? "status-action" : 
                             item.Status == "failed" ? "status-failed" : "")">
                    @item.Status
                </td>
                <!-- your other columns -->
            </tr>
        }
    </tbody>
</table>
