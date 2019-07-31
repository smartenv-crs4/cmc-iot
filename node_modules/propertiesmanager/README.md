# propertiesmanager
This module helps to easily manage all the configuration properties needed in a system, giving a simple and consistent configuration
interface to your application. The properties must have a profile category, **production**,**dev** or **test**. 
File properties are stored in folder config in a file named properties.json within your application home directory(.../config/properties.json).
The package use **npm minimist**, so your properties can be overridden by command line parameters.

[![NPM](https://nodei.co/npm/propertiesmanager.png?downloads=true&downloadRank=true&stars=true)![NPM](https://nodei.co/npm-dl/propertiesmanager.png?months=6&height=3)](https://nodei.co/npm/propertiesmanager/)

 * [Installation](#installation) 
 * [Property file creation](#creation)
 * [Property file population](#populate)
 * [Using propertiesmanager](#using)
 * [Using propertiesmanager in development npm package](#usingpackage)
 * [Loading a running profile](#load)
 * [Ovverride parameters from command line](#override)
 * [Examples](#examples)
    

## <a name="installation"></a>Installation
To install **propertiesmanager**, type:

```shell
$ npm install propertiesmanager
```

## <a name="creation"></a>Property file creation
Configuration files must be created in a folder named <code>config</code> in the home directory of your application.
The filename must be named <code>default.json</code>. Type:
```shell
$ mkdir config
$ vi config/default.json
```

## <a name="populate"></a>Property file population
The file containing your properties is a JSON file having a mandatory dictionary called "production".
It contains all the configuration parameters of your application running in production or default mode.
Other dictionaries can be used, "dev" for development properties and "test" for testing properties.  

An example of empty property file:
```javascript
{
    "production":{}
}
```

An example of populated property file:
```javascript
{
    "production":{
        "properties_One":"One",
        "properties_Two":"Two",
        "Objectproperties":{
            "Obj_One":1,
            "Obj_Two":2
        }    
    }
}
```


An example of property file with dev and test dictionaries defined:
```javascript
{
    "production":{
        "properties_One":"One",
        "properties_Two":"Two",
        "Objectproperties":{
            "Obj_One":1,
            "Obj_Two":2
        }    
    },
    "test":{
       "properties_One":"TestOne",
       "Objectproperties":{
           "Obj_One":1,
           "Obj_Two":2
       }  
    },
    "dev":{
       "properties_One":"Test Development",
       "DevLogs":{
           "path":"/logs/log.xml",
           "format":"xml"
       }  
    }
}
```



## <a name="using"></a>Usage

### Including propertiesmanager

Just require it like a simple package:

```javascript
var propertiesmanager = require('propertiesmanager').conf;
```

### Using propertiesmanager
propertiesmanager returns a dictionary containing all the properties from a configuration file.
These properties can be overridden by command line parameters.
```javascript
   // print the loaded properties dictionary
   console.log(propertiesmanager);   

```


# <a name="usingpackage"></a>Usage in nodule_module packages 

If you use this package to develop other node_modules, then add `"install": "npm install propertiesmanager"` in the 
`scripts` tag in your package.json as below: 

 ```shell
 
  // yur package.json
 {
    ......
    ......
    "scripts": {
        .......
        "install": "npm install propertiesmanager"
      },
    ......
    ......
 }


```

You need to do this because propertiesmanager looks for the property file (config/default.json) in a folder located two
levels up the node_modules folder, so propertiesmanager must be installed in the node_modules folder of the package 
that uses it as a dependence
 




## <a name="load"></a>Loading a running profile
The application using this package runs under one profile among three (production, dev, test), set by NODE_ENV environment variable.
If NODE_ENV is not defined the default profile is **production**

Running your app in default mode. **production** properties are loaded:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ npm start   
```

Running your app in production mode. **production** properties are loaded:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ NODE_ENV=production npm start
```

Running your app in dev mode. **dev** properties are loaded:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ NODE_ENV=dev npm start
```

Running your app in test mode. **test** properties are loaded:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ NODE_ENV=test npm start
```



## <a name="override"></a>Override loaded parameters from command line
The package propertiesmanager use **npm minimist**, so your properties stored in default.json can be 
overridden by command line parameters. Just type in command line <code>--ParamName=ParamValue</code>, as in:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ NODE_ENV=dev npm start -- --properties_One="Override_TestOne"
```

The first <code>--</code> after <code>npm start</code> means that the following params must be passed to <code>node bin/www</code>,
so if you run your application directly calling  <code>node bin/www</code> the first <code>--</code> must be not used, as in:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ NODE_ENV=dev node bin/www --properties_One="Override_TestOne"
``` 

To override parameters that are complex objects, use dotted (".") notation. For example:
 ```shell
 
  // We want to override Obj_One
 {
     "production":{
         "properties_One":"One",
         "properties_Two":"Two",
         "Objectproperties":{
             "Obj_One":1,
             "Obj_Two":2
         }    
     }     
 }

$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ NODE_ENV=dev node bin/www --Objectproperties.Obj_One="Override_Obj_One"
``` 
For further information about passing parameter see `https://www.npmjs.com/package/minimist`

## <a name="examples"></a>Examples

### File Properties creation
From your home project directory type:
```shell
$ mkdir config
$ vi config/default.json
```

Write <code>default.json</code> property file:
```javascript
{
    "production":{
        "properties_One":"One",
        "properties_Two":"Two",
        "Objectproperties":{
            "Obj_One":1,
            "Obj_Two":2
        }    
    },
    "test":{
       "properties_One":"TestOne",
       "Objectproperties":{
           "Obj_One":1,
           "Obj_Two":2
       }  
    },
    "dev":{
       "properties_One":"Test Development",
       "DevLogs":{
           "path":"/logs/log.xml",
           "format":"xml"
       }  
    }
}
``` 
Now you can print all your properties:
```javascript

   var propertiesmanager = require('propertiesmanager').conf;
   
   // print the loaded properties dictionary
   console.log("########### Readed Properties ###########" );
   console.log(propertiesmanager);   

```

Running your app in default mode, production properties are loaded:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ npm start
########### Read Properties ###########
"production":{
          "properties_One":"One",
          "properties_Two":"Two",
          "Objectproperties":{
              "Obj_One":1,
              "Obj_Two":2
          }    
      }     
```

Running your app in production mode <code>(NODE_ENV=production)</code> is equivalent to run in default mode:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ NODE_ENV=production npm start
########### Readed Properties ###########
"production":{
          "properties_One":"One",
          "properties_Two":"Two",
          "Objectproperties":{
              "Obj_One":1,
              "Obj_Two":2
          }    
      }     
```

Running your app in dev mode <code>(NODE_ENV=dev)</code>, dev properties are loaded:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ NODE_ENV=dev npm start
########### Readed Properties ###########
"dev":{
       "properties_One":"Test Development",
       "DevLogs":{
           "path":"/logs/log.xml",
           "format":"xml
       }  
    }
```

Running your app in test mode <code>(NODE_ENV=test)</code>, test properties are loaded:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ NODE_ENV=test npm start
########### Readed Properties ###########
 "test":{
       "properties_One":"TestOne",
       "Objectproperties":{
           "Obj_One":1,
           "Obj_Two":2
       }  
    }
```


Overriding some test mode <code>(NODE_ENV=test)</code> properties:
```shell
$ cd "YOUR_APPLICATION_HOME_DIRECTORY"
$ NODE_ENV=dev npm start -- --properties_One="Override_TestOne"
########### Readed Properties ###########
 "test":{
       "properties_One":"Override_TestOne",
       "Objectproperties":{
           "Obj_One":1,
           "Obj_Two":2
       }  
    }
```



License - "MIT License"
-----------------------

MIT License

Copyright (c) 2016 aromanino

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Author
------
Alessandro Romanino ([a.romanino@gmail.com](mailto:a.romanino@gmail.com))<br>
Guido Porruvecchio ([guido.porruvecchio@gmail.com](mailto:guido.porruvecchio@gmail.com))

Contributors
------
CRS4 Microservice Core Team ([cmc.smartenv@crs4.it](mailto:cmc.smartenv@crs4.it))
