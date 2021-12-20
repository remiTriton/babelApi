## Babel API

This is the backend server for our Babel website. 

Everything here handles the database and the authentication of our services.

## How to install ?

```
npm install
```

If you want to try it, you'll have to create a .env file with a MONGODB_URI to connect to a database.

```
npm run populate
```

This commands will add all wines provided in the data.csv in the populate_db folder.

```
npm run dev
```

This will launch the sever using Nodemon, a tool restarting constantly the server whenever a file is changed.

## The routes

### Wines

Here, you'll see all routes available to fetch the wines provided by the app.

### Orders

What is an order for us ?

Let's imagine we want to put a wine in an order, and, later, modify the quantity provided or even delete it. Here, we handle this.

Furthermore, you have to know that when a wine is modified with the status 'Confirmed', you will not be able to update it afterwise. This was asked by our client.

### Users

We handle in this route things related to authentication and security, and what users can and can't do.

### Password Reset

Just a simple route which allows an user who has forgotten this password to retrieve it. We use Nodemailer to help us send mails.


## Our libraries

For the requests, we use Express.
The server runs thanks to Nodemon.
We use Bcrypt to encrypt passwords.
Nodemailer sends emails for us.
Jsonwwebtoken creates token used for authorizations.
dotenv to read the .env files.


