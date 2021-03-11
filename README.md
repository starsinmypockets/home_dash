# HOME DASH

Open source tools for monitoring indoor air quality.

## Setup

### Install packages

`yarn`

### Setup MYSQL database
You will need to setup a database table and user. Store db credentials in .env (see below).

```mysql
CREATE DATABASE home_dash;
CREATE USER 'home_dash'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON * . home_dash TO 'home_dash'@'localhost';
```

### Setup db table
The table should be created when the app is run for the first time.

But just in case:
```mysql
CREATE TABLE IF NOT EXISTS home_dash.data (
    data_id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    units VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Setup environment

cp `sample.env` to `.env` and update with your db creds

## Start server

`yarn start`

## ENPOINTS

### POST /new

  Array of new records to enter:
  JSON BODY:
  ```json
  [
    {
      "name":"Office",
      "type":"PM2.5",
      "units":"PM2.5",
      "value":"2"
    }
  ]
  ```
