npm run lint

returnCode=$(echo $?)


if [[ $returnCode -ne 0 ]]; then
    echo "Linting failed"
    exit $returnCode
else
    echo "Linting passed"
    git push
fi