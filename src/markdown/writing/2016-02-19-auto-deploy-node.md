# Automatic Deployment with Git on a VPS for Node.js

#### February 19th 2016

There's a lot of types of blogs out there- wordpress/tumblr/jekyll/hexo, but mine is none of those. My blog is a node.js server that renders markdown files in real time. So for that to work, it needs to keep a node.js process running 24/7. 

One thing that I wanted to do is automatically deploy to my server without copying over all of my files. The way my setup works is I run Git and push it directly to my server. Using a [post-receive git hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks), it automatically runs the following script when the server receives the push [[1]](#1):

```
T_REPO=$HOME/homepage.git
GIT_REPO=$HOME/homepage/

cd $GIT_REPO
unset GIT_DIR
git pull
sudo pkill -f "node app.js"
npm install
sudo nohup node app.js &
exit
```

** Explanation **

- The first part basically means go into the directory and pull the repo.

```
T_REPO=$HOME/homepage.git
GIT_REPO=$HOME/homepage/

cd $GIT_REPO
git pull
```
- I had this [funky error](http://stackoverflow.com/questions/9905882/git-post-receive-not-working-correctly) where it would not recognize this as a repo, so I had to add another line:

`unset GIT_DIR`

- When going through this exercise of actually deploying node.js on a server, I realized I needed a way to [daemonize](https://en.wikipedia.org/wiki/Daemon_(computing)) the node.js process:

`sudo nohup node app.js &`

- And also end the previous node.js process that I created:

`sudo pkill -f "node app.js"`


** Deployment on Server ** 

Go into the VPS and go to the directory where you want to host Node.js (preferable not as the root user.) Run the following code

```
git clone --bare https://github.com/blin17/homepage.git
cd .git/hooks
touch post-receive
chmod +x post-receive
vim post-receive
```

Paste the following code-block into the file:

```
T_REPO=$HOME/homepage.git
GIT_REPO=$HOME/homepage/

cd $GIT_REPO
unset GIT_DIR
git pull
sudo pkill -f "node app.js"
npm install
sudo nohup node app.js &
exit
```

** On Local Machine **
``` 
git remote add server user@domain.com:directory/homepage.git
(After working)
git add .
git commit -m "commit"
git push server master
```

<div id = "notes">
**Notes**
</div>

<span id = "1">1</span> This [guide](https://www.digitalocean.com/community/tutorials/how-to-set-up-automatic-deployment-with-git-with-a-vps) from Digital Ocean got me to 50%. But I needed to figure out how to customize it for Node.js.
