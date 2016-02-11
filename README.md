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

That's it! The ZenithWGL engine is now up and running! "But why is my canvas black? I don't see anything on my screen!" The ZenithWGL engine is composed of 2 important objects: the Render object and the World object. The Render object is responsible for, you guessed it, rendering the screen. Using this object, we can set the background color, depth testing, stencil testing, resize the canvas, and render the world. The World object encompasses a few important elements: the input for the canvas, the camera used to view the final picture, the shader that describes how the final picture should look, and the objects that will be rendered. We haven't added any objects yet. That explains why our canvas is currently black.

## Objects
ZenithWGL uses the Wavefront file format (.OBJ). It can read these files from anywhere on the internet. Simply pass a valid path to the object creation method. Let's start by creating a cube object.
```
var cube = zenithWGL.createObject("/path/to/cube.obj");
```

Remember, ZenithWGL reads Wavefront files from the internet, so you need to provide a path to the object file you want to load. This function returns an Object object. Objects have a model, a material, a scale, a position, and a rotation. You always have to set the material of an object for it to render. At this time, ZenithWGL does not support textures, but this feature is coming very soon. For now, stick with colors. First, we need to create a new material for our cube. We will make it a red cube.
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

As you can see, rendering objects using ZenithWGL is super easy.
