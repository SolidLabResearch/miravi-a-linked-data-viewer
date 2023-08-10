import { Layout } from "react-admin";
import GDVAppBar from "./GDVAppBar/GDVAppBar";


function GDVLayout(props){
    return (
        <Layout {...props} appBar={GDVAppBar}/>
    )
}

export default GDVLayout;