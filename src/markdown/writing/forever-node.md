# Continous Deployment of Node with Forever

#### October 31th 2016

sudo npm install -g forever
sudo forever start --uid 'node' -a app.js
sudo forever stop -uid 'node'

ps aux | grep app.js
sudo pkill -f "app.js"
sudo kill -kill [PID]