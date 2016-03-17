# ZenithWGL
## What is ZenithWGL?
ZenithWGL is a client side WebGL Engine API that allows developers to quickly create WebGL projects without having to deal with the complexity of low-level graphics programming. ZenithWGL handles asset management, rendering, and input. It is simple and easy to use, while providing enough customization and flexibility to accomplish anything you set out to do. ZenithWGL is currently under development.

## What do I need in order to use ZenithWGL?
Very little. ZenithWGL only has 2 dependencies: [glMatrix](http://glmatrix.net/) (written by [toji](https://github.com/toji)) and webgl-utils (written by Google). Both of these dependencies are included in this project, but ZenithWGL needs both to run, so don't forget to reference these scripts. Lastly, you'll need the ZenithWGL.js script found in this project.

## How is ZenithWGL used?
ZenithWGL strives to abstract as much low-level complexity away from the developer as possible, while still granting the developer the ability to alter the engine to fit his/her needs. So how do you hit the ground running with ZenithWGL? Just as you would in a normal WebGL application, the first step is to create a static or dynamic webpage that contains an HTML5 canvas element and references your WebGL project script. Don't forget to reference the dependencies!
```
<body onload="myWebGLApp()">
    <canvas id="myWebGLCanvas" width="800" height="600"></canvas>
    <script type="text/javascript" src="/path/to/gl-matrix.js"></script>
    <script type="text/javascript" src="/path/to/webgl-util.js"></script>
    <script type="text/javascript" src="/path/to/ZenithWGL.js"></script>
    <script type="text/javascript" src="/path/to/myWebGLApp.js"></script>
    ...
```

The next step is to write a Javascript function that utilizes the power of ZenithWGL. Use the `ZenithWGL()` object to get started!
```
function myWebGLApp() {
    var zenithWGL = new ZenithWGL();
}
```
![alt text](http://i.imgur.com/X2XbIEx.png?1 "ZenithWGL Engine")

That's it! The ZenithWGL engine is now up and running! "But why is my canvas black? I don't see anything on my screen!" The ZenithWGL engine is composed of 2 important objects: the Render object and the World object.

The Render object is responsible for, you guessed it, rendering the screen. Using this object, we can set the background color, depth testing, stencil testing, resize the canvas, and render the world. Any low level graphics configurations are accessed here.

The World object encompasses a few important elements: the input for the canvas, the camera used to view the final picture, the shader that describes how the final picture should look, and the objects that will be rendered. The World is updated every tick before being rendered.

We haven't added any objects yet, so no objects are being rendered right now. That explains why our canvas is currently black.

## Objects
ZenithWGL uses the Wavefront file format (.OBJ). It can read these files from anywhere on the internet. Simply pass a valid path to the object creation method. Let's start by creating a cube object.
```
var cube = zenithWGL.createObject("/path/to/cube.obj");
```

Remember, ZenithWGL reads Wavefront files from the internet (assuming the files can be publicly viewed), so you need to provide an absolute or relative path to the object file you want to load. This function returns an Object object. Objects have a model, a material, a scale, a rotation, and a position. The model holds the physical characteristics of the object such as the meshes, materials, and how they will be rendered. The material determines how light interacts with the object. Scale, rotation, and position are all transformation properties of the object.

**NOTE:** You should always set the material of an object. A material consists of a diffuse color or diffuse texture, a specular color or specular texture, and a shininess value. If the Wavefront file provided in the object constructor includes its own material data (via a materials file), the engine will render these properties instead of the ones you provide by default, but it is important to set the main material properties (diffuse, specular, and shininess) in the event that there is an error with the material file provided. Additionally, you can choose whether the object should be rendered with the imported material data or custom programmed material data. If you do not set the material properties of an object, ZenithWGL will use a default black material with no shine.

First, we need to create a new material for our cube. We will make it a red cube.
```
var cubeMaterial = zenithWGL.createMaterial();
cubeMaterial.setDiffuse(vec3.fromValues(1, 0, 0));
cubeMaterial.setSpecular(vec3.fromValues(0.5, 0.5, 0.5));
cubeMaterial.setShininess(16);
```

Next, we will set the cube's material to the one we just made.
```
cube.setMaterial(cubeMaterial);
```

Let's move the cube away from the camera a little bit.
```
cube.setPosition(vec3.fromValues(0, 0, -5));
```

Finally, we need to spawn the cube in the world.
```
zenithWGL.getWorld().spawn(cube);
```
![alt text](http://i.imgur.com/SvABwVz.png ZenithWGL "Red Cube")

And we're done! As you can see, rendering objects using ZenithWGL is super easy.
