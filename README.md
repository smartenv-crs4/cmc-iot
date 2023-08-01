# CMC-IoT Microservice
CMC-IoT is the Internet of Things microservice of CMC (CRS4 Microservice Core) framework.
It is a general purpose IoT platform and middleware, developed as a custom service compliant with CMC specifications. <br>
CMC-IoT supports a wide class of devices, since it implements an abstraction between the Things and the applications interacting with them. Therefore, it provides a uniform interface to Things, which can be native compatible (e.g. a sensor developed in-house) or need a specific driver or connector to be integrated in the platform. <br>
For API reference, see the service auto-generated online documentation at <code>http://service_base_url/doc</code>.

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
    

### Generate API documentation

    apidoc -i ./routes -o apidoc
    

### Run the application

#### For *development* mode, run:

    NODE_ENV=dev npm start

#### For *production* mode, run:

    npm start
    
