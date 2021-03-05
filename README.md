# HOME DASH

API for managing home automation and sensors via ESP8266

## Setup

### Install packages

`yarn`

### Setup MYSQL database

As root:

```mysql
# create database

CREATE DATABASE home_dash;

# create user
CREATE USER 'home_dash'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON * . home_dash TO 'home_dash'@'localhost';

# create database table
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
      "name":"foo",
      "type":"bar",
      "units":"baz",
      "value":"123"
    }
  ]
  ```
