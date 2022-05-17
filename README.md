# open-music-api-v3
Submission Fundamental Backend Developer Dicoding

# Tambahkan file dengan extension .env dan .prod.env

buat file dan simpan di folder open-music-api-v3:
nama file: .env
## server configuration
HOST=localhost
PORT=5000
 
# node-postgres configuration
PGUSER=<username database kamu>
PGHOST=localhost
PGPASSWORD=<password akun database>
PGDATABASE=<nama database kamu>
PGPORT=5432
 
# JWT token access
ACCESS_TOKEN_KEY=<buat sendiri dengan menggunakan bycrypt>
REFRESH_TOKEN_KEY=<buat sendiri dengan menggunakan bycrypt>
ACCESS_TOKEN_AGE=<isi dengna angka untuk menentukan waktu kedeluarsa token yang akan digunakan oleh client>

# Message broker
RABBITMQ_SERVER=amqp://localhost

# Redis
REDIS_SERVER=localhost

nama file : .prod.env
# server configuration
HOST=0.0.0.0
PORT=5000

buat file dan simpan di folder open-music-api-v3-consumer:
# node-postgres configuration
PGUSER=developer
PGHOST=localhost
PGPASSWORD=<password database kamu>
PGDATABASE=<nama database kamu>
PGPORT=5432

# nodemailer SMTP authentication
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_ADDRESS=<alamat email kamu>
MAIL_PASSWORD=<email password kamu>
