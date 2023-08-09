import { CreateButton, ExportButton, FilterButton, TopToolbar, useListContext } from "react-admin";


function GDVAction(props){
    const {total, isLoading} = useListContext();
    return(
        <TopToolbar >
            <ExportButton disabled={total === 0 || isLoading}/>
        </TopToolbar>
    )
}

export default GDVAction;