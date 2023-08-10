import { RefreshButton, RefreshIconButton, Toolbar } from "react-admin";
import "./GDVToolbar.css";

function GDVToolbar(props){
    return (
        <div {...props} className="gdv-toolbar">
            <RefreshIconButton />
        </div>
    )
}

export default GDVToolbar