import React, {useState} from 'react';
import ListResultTable from "./ListResultTable.jsx";
import {SelectInput, SimpleForm, useResourceContext} from "react-admin";
import {useLocation} from 'react-router-dom';

import config from "../../config";

const TemplatedQueryForm = (props) => {
    const resource = useResourceContext();

    const query = config.queries.filter(
        (query) => query.id === resource
    )[0];

    if (!query.variables) {
        return <ListResultTable {...props}/>;
    }

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);


    const entries = {}
    for (const key of Object.keys(query.variables)) {
        if (queryParams.has(key)) {
            entries[key] = queryParams.get(key)
        }
    }
    const [variables, setVariables] = useState(entries);

    const [redirectToList, setRedirectToList] = useState(Object.keys(entries).length === Object.keys(query.variables).length)

    const onSubmit = (data) => {
        setVariables(data)
        setRedirectToList(true);
    }

    if (redirectToList) {
        return <ListResultTable {...props} variables={variables}/>;
    }

    return (
        <SimpleForm onSubmit={onSubmit}>
            {Object.entries(query.variables).map(([name, options]) => (
                <SelectInput key={name} source={name} name={name} choices={
                    options.map((option) => ({
                        id: option,
                        name: option
                    }))
                }/>
            ))}
        </SimpleForm>
    )
}

export default TemplatedQueryForm;