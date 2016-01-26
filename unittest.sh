if [[ -z $1 || -z $2 || -z $3 ]]; then
    echo "Usage : unittest [NAME] [URL] [EXPECTED STATUS CODE]"
else
    echo -n "$1 : " ; res="`curl -X GET -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjgwNThmMGM0ODNkNTJmN2ZjNTcyNDUiLCJ1c2VybmFtZSI6InRlc3QiLCJleHAiOjE0NTY0Mzc2MjUsImlhdCI6MTQ1MTI1MzYyNX0.nA0QMRLv1RmnyexYFMFUXctb4tlt2tddZU15ji3QYcg" $2 -p -I -s`" && (test1=`echo "$res" | grep HTTP/1.1 | cut -d' ' -f2 | grep $3` && test -n $test1 && echo -e "\e[01;32mOK\e[00m") || echo -e "\e[01;31mKO\e[00m"
fi
