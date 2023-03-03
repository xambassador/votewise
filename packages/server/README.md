## @votewise/server

This workspace contains all the backend logic.


## Convention
Response object contains following keys, depending on request is success or not.

```javascript
{
    message: "...",
    data: {} | null,
    error: null | { message: "" },
    success: true | false
}
```

message: Short description of action <br/>
data: If request is successful, then data contain object with some data. <br/>
error: If request is fail, then error contain object with message key that describe possible reason of failure <br/>
success: Flag indicate whether request is successful or not. <br/>
