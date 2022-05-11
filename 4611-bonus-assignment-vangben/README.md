# Bonus Assignment: Create Your Own Game

Play here!: https://csci-4611-spring-2022.github.io/bonus-assignment-vangben/

The purpose of this assignment to apply the graphics concepts you have learned in class to design and implement your own 3D game!  This is an optional bonus assignment that will replace the lowest score on the previous programs *only* if it benefits your grade.

Unlike the work we have done previously, this assignment is completely open-ended.  You are completely free to implement whatever interactive 3D graphics program you want, so long as you meet the specific requirements listed below.  If you want to make a more serious application instead than a game, that is also possible.  This is your opportunity to show off what you can do with 3D graphics!

## Submission Information

You should fill out this information before submitting your assignment. Make sure to document the name and source of any third party assets that you added, such as models, images, sounds, or any other content used that was not solely written by you. 

Name: Benjamin Vang - vang2756

Third Party Assets:
mud texture - https://www.pinterest.com/pin/173529391882718477/
bomb skin texture - https://www.pinterest.com/jesseheinitz/material-lighting-bomb/
sky text font - https://github.com/mrdoob/three.js/blob/master/examples/fonts/helvetiker_bold.typeface.json
rabbit skin texture - https://depositphotos.com/102828240/stock-photo-rabbit-fur-fur-texture.html


```
/* Add your design specification here. This should include:
 * Motivation/objective of the application:
      First person shooter simulation to shoot  balls at killer bunnies to protect hippo in the center of screen
 * Description of all its features and functions
     - raycasting from mouse clicks to shoot balls
     - wasd movement
     - up to 10 bunnies spawn in at intervals and move on a vector towards the hippo
     - ground, bunnies, and ball is texture mapped with jpg's in /assets folder
     - collision detection between bunnies and hippo(game ends) and also balls and bunnies(bunnies die and disappear)
     - bunnies' 3d mesh change to red color upon reaching hippo (fulfills "dynamic vertex" requirement?)
     - WIZARD Functionality: 3D text appears above hippo at beginning and is replaced with game over upon losing game. Dynamic counter 
     to modify 3D text based on number of kills (3D mesh dynamic vertex requirement)
 * Complete instructions for the controls
      WASD to move. Left mouse click to shoot balls
 * Anything else we need to know to run and grade your program.
     Only one ball can be shot at a time
     This was super fun to make! 
 */
```

## Prerequisites

To work with this code, you will first need to install [Node.js](https://nodejs.org/en/) and [Visual Studio Code](https://code.visualstudio.com/). 

## Getting Started

The starter code implements the same basic structure that we have used in other programs in this class.  After cloning your repository, you will need to set up the initial project by pulling the dependencies from the node package manager with:

```
npm install
```

This will create a `node_modules` folder in your directory and download all the dependencies needed to run the project.  Note that this folder is `.gitignore` file and should not be committed to your repository.  After that, you can compile and run a server with:

```
npm run start
```

The build system should launch your program in a web browser automatically.  If not, you can run it by pointing your browser at `http://localhost:8080`.

## Rubric

You have a great deal of freedom in implementing this assignment.  Although your program does not necessarily need to be a game, it should some specific goal or objective for the user.  It another words, just drawing a bunch of 3D objects on the screen for no particular reason will not be sufficient.  Your program will be graded out of 20 points according to the following criteria:

- Write a detailed design specification, as described in the "Submission Information" section.  (2)
- A basic scene has been created for you, including a ground plane, skybox, and a couple lights.  You should either extend or replace these existing objects to create a more visually interesting scene. You can feel free to use shapes built-in to Three.js or import 3D models that you find online, although make sure to cite any third party content that you include in your program.  (3) 
- Your program should be *interactive*.  You are free to implement this however you want, including using the keyboard, mouse, or GUI widgets.  However, just drawing static objects on screen with no user interaction will not be sufficient. (3)
- Your program contains at least five moving 3D objects.  They can either be directly controlled by the user, animated using prerecorded data, or physically simulated using gravity/collisions.  (4) 
- Your program should make use of collision detection to do something interesting when (at minimum) two objects collide. (4)
- Your program should include at least one 3D mesh with dynamic vertex properties.  For example, it could morph into another 3D shape or change other vertex buffers, such as normals or colors.  (2)
- At least two objects in the scene should be texture mapped. (2)

## Wizard Bonus Challenge

Similar to previous assignments, you can earn **one bonus point** for going above and beyond the basic requirements for this assignment.  However, the criteria for being a "wizard" is a bit less specific due to the open-ended nature of the assignment.  During grading, we will look for the students that have truly attempted to do something exceptional, ambitious, or creative.  If you have a specific feature that you are proud of and would like us to make sure we consider it for the wizard bonus, please note this in the "Submission Information" section of your readme file.

## Third Party Assets

In this assignment, you may want to download art assets on the internet.  A couple good sources for free 3D models include [CGtrader](https://www.cgtrader.com/) and [Kenney](https://kenney.nl/).  However, make sure to document all the third party assets included with your project, and include links to wherever you found them.  *Points may be deducted for third party assets that are not documented!*

## Submission

When you commit and push your assignment to GitHub, an automated script will build and deploy the production code to the `gh-pages` branch of your repository.  However, your submission is not complete until you do the following:

1. Open your repository on GitHub and go to Settings->Pages.
2. Change the source to the `gh-pages` branch, then save.

You will need to wait a few minutes for the website to deploy.  After that, make sure to test everything by pointing your web browser at the link generated for your build:

```
https://csci-4611-spring-2022.github.io/your-repo-name-here
```

If your program runs correctly, then you are finished!  The published build will indicate to the TAs that your assignment is ready for grading.  If you change your mind and want to make further changes to your code, then just delete the `gh-pages` branch and set the GitHub pages source back to `None`, and it will unpublish the website.

Note that the published JavaScript bundle code generated by the TypeScript compiler has been minified so that it is not human-readable. So, you can feel free to send this link to other students, friends, and family to show off your work!

## License

Material for [CSCI 4611 Spring 2022](https://canvas.umn.edu/courses/290928/assignments/syllabus) by [Evan Suma Rosenberg](https://illusioneering.umn.edu/) is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
