import {Button} from "react-admin";
import EditIcon from "@mui/icons-material/Edit";
import {useNavigate} from "react-router-dom";

function QueryEditButton(props) {

    const navigate = useNavigate();

    const onClick = () => {
        navigate("edit")
    }

    return (
        <Button onClick={onClick}>
            <EditIcon/>
            Edit
        </Button>
    )
}

export default QueryEditButton;