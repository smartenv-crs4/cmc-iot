# CMC IoT Microservice
CMC IoT is the Internet of Things microservice of the CMC (CRS4 Microservice Core) framework.
It takes care of managing ...... <br>
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
    
