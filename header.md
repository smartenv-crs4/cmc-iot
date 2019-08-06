[comment]: # (TODO rimuovi cport e metti link di CMC)
For more info about the project, please visit the [CRS4 SMART ENVIRONMENTS AND TECHNOLOGIES official website](http://www.crs4.it)

Security & Authentication
-------------------------
All API endpoints use **HTTPS** protocol.

All API endpoints **require authentication**.



Thus, you MUST obtain an API token and use it in HTTP header, as in:

    Authentication: Bearer <API_TOKEN>

or appending a URL parameter as in:

    /users?access_token=<API_TOKEN>

or appending in body request as in:

        {access_token=<API_TOKEN>}

***


All parameters described in API documentation refers to default defined schema models. If you redefine one or more 
schema models, ypu must realign all API parameters to you redefined schema models.

Pagination
-------------------------

All `GET /resource_name` endpoints providing a listing functionality, use `skip=value&limit=value` to returns paginated responses.
Pagination information is always provided using the following format:

    ...
    "_metadata":{
                    "skip":10,
                    "limit":50,
                    "totalCount":1500
    }



totalCount is set to disabled(false) by default. If you need it, you must specify it in the request by set `skip=value&limit=value&totalCount=true`   

Field projection
-------------------------

All `GET` endpoints providing a fields projection functionality, use `fields=field_name_1,field_name_2` to returns responses with fields projection.
Fields projection names must be a string comma separated. 
To remove a field from results use the `-fieldname` syntax eg. `fields=-field_name`

Ordering results
-------------------------

All `GET /resource` endpoints providing order functionality, use `sortAsc=field_name_1&sortDesc=field_name_2` to returns responses with ordered results.
sortAsc order by specified fields ascending values.
sortDesc order by specified fields descending values.


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

