BASEURI='http://localhost:3000'
clear
echo -e "\n\e[01;33mLaunching Continuous integration now\e[00m\n__________________________\n\n"

./unittest.sh "Get Users" "$BASEURI/users" "200"
./unittest.sh "Get Calendars" "$BASEURI/calendars" "200"
./unittest.sh "Get One Calendar" "$BASEURI/calendars/568a8d74ac6e91f655d534f1" "200"

echo -e "\n_________________________\n\n\e[01;33mJob finished\e[00m\n"
