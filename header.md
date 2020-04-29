For more info about the project, please visit the [GitHub project page](https://github.com/smartenv-crs4/cmc)

**Important!** All parameters described in the API documentation refers to default schema models. If you redefine one or more 
schema models, you must update all API parameters according to your custom schema model(s).

***

Security & Authentication
-------------------------
All API endpoints use the **HTTPS** protocol and require authentication.

Thus, you MUST obtain an API token and use it in the HTTP `Authorization` header:

    Authorization: Bearer <API_TOKEN>

or append it as URL parameter:

    /devices?access_token=<API_TOKEN>

or append it in the request body (when a body is accepted):

    {access_token=<API_TOKEN>}

When the token is set as URL parameter, the same token sent in `Authorization` header must be `undefined`, and vice versa.

***

Pagination
-------------------------

All `GET /resource_name` endpoints, which return a list, use `skip=value&limit=value` URL parameters to return a paginated response.
Pagination settings are returned in the following format:

    ...
    "_metadata":{
                    "skip":10,
                    "limit":50,
                    "totalCount":1500
    }

`totalCount` is disabled by default. If you need it, you must specify it in the request appending `&totalCount=true`, i.e. `skip=value&limit=value&totalCount=true` <br>
When `skip` and `limit` values are not provided, default values set in `default.json` are used. <br>
Other endpoints returning a list of objects (such as search actions) provide a different way to set result pagination, which will be described in the endpoint documentation.

***

Search
-------------------------

All `GET /resource_name` endpoints,  which return a list, use `resource_name=resource_id_1,resource_id_2` parameters to return a list filtered by resource id. <br>
Search strings can be a string (e.g. `devices=123456`), a string array (e.g. `devices=12345&devices=54321`) or a list of comma separated strings (e.g. `things=12345,54321`) <br>
Searches can be performed in the same fashion filtering by a field, e.g. a string or a boolean (`name=MyDev`, `disabled=true`). <br>
If you set fields equal to a list of IDs' e.g. `fields=idslist` an array of objectId is returned instead an array of objects. <br>
Other endpoints returning a list of objects (such as search actions) provide a different way to perform searches, which will be described in the endpoint documentation.
***
 
Field projection
-------------------------

All `GET /resource_name` endpoints providing a field projection functionality, use `fields=field_name_1,field_name_2` parameters to return responses with fields projection.
Fields projection names must be comma separated strings. 
To remove a field from results, use the `-fieldname` syntax, e.g. `fields=-field_name` <br>
Other endpoints returning a list of objects (such as search actions) provide a different way to set result projection, which will be described in the endpoint documentation.

***

Ordering results
-------------------------

All `GET /resource_name` endpoints providing ordering functionality, use `sortAsc=field_name_1&sortDesc=field_name_2` parameters to return the ordered results. 
If you have more than one ordering field, they must be comma separated strings, i.e. `sortAsc=field_name_1,field_name_2`. <br>
`sortAsc` orders by ascending values of the specified fields. <br>
`sortDesc` orders by descending values of the specified fields. <br>
Other endpoints returning a list of objects (such as search actions) provide a different way to set result ordering, which will be described in the endpoint documentation.

***

Error responses
-----------------------
All error responses are structured as follows:

`response.body.StatusCode` contains the error status code <br>
`response.body.error` contains the error name <br>
`request.body.message` contains the error message

***

Access_Token to try API
-----------------------

<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;}
.tg td{font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;}
.tg th{font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;}
.tg .tg-baqh{text-align:center;vertical-align:top}
</style>
<table class="tg">
  <tr>
    <th class="tg-baqh">Token Type</th>
    <th class="tg-baqh">access_token</th>
  </tr>
  <tr>
    <td class="tg-baqh">User Token Type</td>
    <td class="tg-baqh">eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.<br>eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YmRhNWMxMzk1YTNkMjdhYmVjMzQ5YiIsImVtY<br>WlsIjoiYWRtaW5AYWRtaW4uY29tIiwidHlwZSI6ImFkbWluIiwiZW5hYmxlZCI6dHJ1ZSwiZXhwIjoxNDkwMDE3MDcyNDY4fQ.<br>NS0B-MnuMensDhLBe13I3dxzKWvqQeKQ5Z49cqmIeXs</td>
  </tr>
  <tr>
    <td class="tg-baqh">Application Token Type</td>
    <td class="tg-baqh">eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.<br>eyJtb2RlIjoiZGV2ZWxvcGVyIiwiaXNzIjoiNThjNmQyNGMxMWFmMTA4MWY2OTYwZTE3I<br>iwiZW1haWwiOiJwaXBwbzZAcGlwcG8uaXQiLCJ0eXBlIjoiYWRtaW5BcHAiLCJlbmFibGVkIjp0cnVlLCJleHAiOjE0OTAwMjk3NzMwNzh9.<br>jXivXxjnOlbFVBiLpdS1em2__EvS08Ms4pf5jtVz9Mo</td>
  </tr>
  <tr>
    <td class="tg-baqh">Microservice Token Type</td>
    <td class="tg-baqh">eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoibXMiLCJpc3MiOiJub3QgdXNlZCBmbyBtcyIsImVtYWlsIjoibm90IHVz<br>ZWQgZm8gbXMiLCJ0eXBlIjoidXNlcm1zLWRlbW8iLCJlbmFibGVkIjp0cnVlLCJleHAiOjE4MDYyMjgyOTE0NTR9.<br>YWku3TNMUqBpVzPKvj99o34gHRlPZiG51YWiqY1WTc8</td>
  </tr>  
</table>
