## @votewise/server

This workspace contains all the backend logic.


## Convention
- Response object contains following keys, depending on request is success or not.

{
    message: "...",
    data: {} | null,
    error: null | { message: "" },
    success: true | false
}

message => Short description of action
data: If request is successful, then data contain object with some data.
error: If request is fail, then error contain object with message key that describe possible reason of failure
success: Flag indicate whether request is successful or not.
