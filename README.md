# CMC-IoT Microservice
CMC-IoT is the Internet of Things microservice of CMC (CRS4 Microservice Core) framework.
It is a general purpose IoT platform and middleware, developed as a custom service compliant with CMC specifications. <br>
CMC-IoT supports a wide class of devices, since it implements an abstraction between the Things and the applications interacting with them. Therefore, it provides a uniform interface to Things, which can be native compatible (e.g. a sensor developed in-house) or need a specific driver or connector to be integrated in the platform. <br>
For API reference, see the service auto-generated online documentation at <code>http://service_base_url/doc</code>.

## Documentation status

The API documentation is already included in this repository under <code>/doc</code>.
After project download, users do not need to generate documentation to read or browse the API reference.

### Open documentation from this README

- Local static documentation (repository): [Open API documentation](doc/index.html)
- Runtime endpoint (service running): [Open /doc endpoint](http://service_base_url/doc)
- Local runtime example: [http://localhost:3000/doc](http://localhost:3000/doc)

### API documentation summary

- Main format: apiDoc-generated HTTP API reference.
- Source of truth: inline apiDoc blocks in route handlers under <code>/routes/routesHandlers</code>.
- Published output in repository: <code>/doc</code> (including <code>index.html</code>, <code>api_data.json</code>, <code>api_project.json</code>, assets).
- Runtime access (when service is running): <code>http://service_base_url/doc</code>.

## Usage

### Install

#### 1) Install Mocha (for testing):

    sudo npm install -g mocha

#### 2) Install apiDoc (for API documentation):

    sudo npm install -g apidoc

#### 3) Install all dependencies
    
    npm install


### Run test suite

    npm test
    

### Generate final exhaustive API documentation (maintainers)

Use this only when apiDoc comments are updated and you want to refresh the committed documentation artifacts.

#### 1) Ensure dependencies are installed

    npm install

#### 2) Generate documentation directly into <code>/doc</code>

    apidoc -i ./routes -o ./doc

#### 3) Validate generated output

- Open <code>doc/index.html</code> in a browser, or
- Run the service and visit <code>http://service_base_url/doc</code>

#### 4) Commit updated documentation artifacts

When documentation is intentionally refreshed, include updated files from <code>/doc</code> in the same commit as the related API/doc changes.
    

### Run the application

#### For *development* mode, run:

    NODE_ENV=dev npm start

#### For *production* mode, run:

    npm start
    
