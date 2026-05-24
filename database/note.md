# Export

PGPASSWORD=<mypassword> docker-compose exec <ten-service> pg_dump -U <username> <tendb> > <tenfile>.sql

# Import

## B1: Copy file sql vào container

docker cp <duong-dan-sql-host> <ten-container>:/<ten-file-sql-container>

## B2: Import bằng lệnh psql trong container

1. Vào container

docker-compose exec <ten-service> sh

2. Chạy lệnh import

psql -U <username> -d <database_name> -h <hostname> -f <path/to/dump_file.sql>
