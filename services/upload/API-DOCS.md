## API Endpoints

###### POST /handshake : For performing handshake

- Payload: Request must contain body and body must contain filename<br/>
- Response: 400, If filename or body is missing<br/>
  { success: boolean, message: string } <br>
- Response: 200, { success: boolean, token: string, fileName: string, message: string }

###### POST /upload: Upload file to server

- Need to pass x-file-token, x-filename, and content-renge in headers.<br/>
- Token can be obtaine from /handshake route.<br/>

- Response: 400, If content range header is missing, If x-file-token header is missing, If content range is not valid<br/>
- Response: 200, { success: boolean, message: string, data: {
  url: string
  }}

###### GET /upload-status?token={}&filename={}: For performing resume

- Response: 200, { totalChunkUploaded: number }<br/>

###### DELETE /upload?token={}&filename={}: Delete file

###### GET /heartbeat: Check whether service is up or down
