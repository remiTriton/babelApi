## start docker for mongodb
> ./start


## start backend
> cd ./back/
> npm run start

## curl cmd

### insert wine
```bash
curl -d '{"wineName":"a cool wine", "color":"blue"}' -H "Content-Type: application/json" -X POST http://localhost:3001/api/wines
```

### get wine
```bash
curl http://localhost:3001/api/wines/HERE_YOUR_ID 
```

### get wines
```bash
curl http://localhost:3001/api/wines
```


### insert user
```bash
curl -d '{"firstname":"Remi", "lastname":"triton", "email":"remi.triton@epitech.eu", "password":"1234"}' -H "Content-Type: application/json" -X POST http://localhost:3001/api/users
```