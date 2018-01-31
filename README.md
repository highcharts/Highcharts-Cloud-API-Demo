## Highcharts cloud API demo
Open a command line and launch ``npm install``

Create a data.json and add the right credentials:
```json
{  
    "teamID" : 123456,   
    "APIKey" : "123456abcd",  
    "dbCredentials":{
        "DBlogin" : "name",
        "DBpwd" : "123456abcd" 
    },
    "BLink" : "12345abcd 
}
```

Start the server ``node myServer.js``

Click on ``index.html`` and use the buttons in this order:
- Read data from database
- Send data to Highcharts Cloud
- Duplicate chart
- Delete chart
