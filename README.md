docker run -it -d --restart=always --name printer-reporter --network=host -p 3000:3000 -e "DBHOST=$(ip -4 addr show docker0 | grep -Po 'inet \K[\d.]+')" -e DBUSER=yourdbuser -e DBPASS=yourdbpassword -e DBNAME=yourdbname lspiehler/printer-reporter:latest

cat << EOF > .env
DBHOST=yourdbhost
DBUSER=yourdbuser
DBPASS=yourdbpassword
DBNAME=yourdbname
EOF
