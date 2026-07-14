import { DataTable } from "@/components/data-table"
import data from "./data.json"

const LogsPage = () => {
    return (
         <DataTable data={data} />
    )
}

export default LogsPage;