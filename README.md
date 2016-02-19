personal website w/ automatic conversion for markdown

-- config.js change port if needed
* 80 for server
* 3000 for localhost

-- Git pulling without server
git reset --hard HEAD
git pull

-- Markdown syntax
https://daringfireball.net/projects/markdown/syntax

-- Find Process && kill
ps aux | grep node
kill [pid]
OR
sudo pkill -f "node app.js"

-- Node App.js
nohup node app.js &

--setting up a git server
(https://git-scm.com/book/en/v2/Git-on-the-Server-Setting-Up-the-Server)

--post-receive file (https://www.digitalocean.com/community/tutorials/how-to-set-up-automatic-deployment-with-git-with-a-vps)
T_REPO=$HOME/homepage.git
GIT_REPO=$HOME/homepage/

cd $GIT_REPO
unset GIT_DIR
git pull
sudo pkill -f "node app.js"
npm install
sudo nohup node app.js &
exit

