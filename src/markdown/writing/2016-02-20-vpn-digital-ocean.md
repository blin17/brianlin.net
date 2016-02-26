# How to set up a VPN Server on Digital Ocean

#### Feb 20 2015


I wanted to write a blog entry on how I set up my VPN server in preparation of China.

### Step 1: Create a Digital Ocean Account

1. First, if you don't have an account, use the [Student Developer Pack](https://education.github.com/pack) to get a $50 voucher code. 
2. Then use [my referral link](https://m.do.co/c/c93d76989ecb) to get an additional $10.  

Using those steps, you can get enough free credits to last you a year!

### Step 2: Create a Droplet

On the Digital Ocean homepage, click the Create Droplet button on top right.

Select the Distribution Ubuntu  
![Ubuntu](/img/vpn-screen1.png)

Select the $5 option  
![$5 option](/img/vpn-screen2.png)

Select a droplet in Singapore
![Singapore Droplet](/img/vpn-screen3.png)

Finally, click Create

### Step 3: SSH into your droplet

Digital Ocean will send you your IP address and your root password. We'll need those later.  

Now to connect to your droplet and setup the VPN server. Open Terminal and run this:  
`ssh root@[DROPLET's IP ADDRESS]`

When it prompts you for the password, just copy the password from the email. Then create a new password that you can remember. 
```
Changing password for root.
(current) UNIX password:
Enter new UNIX password:
Retype new UNIX password:
```

Then run wget to get the VPN script:  
`wget https://raw.github.com/viljoviitanen/setup-simple-pptp-vpn/master/setup.sh`

Create a username and password for the VPN and then run:  
`sudo sh setup.sh -u [VPN USERNAME] -p [VPN PASSWORD]`

Now your Point to Point Tunneling Server (PoPToP) VPN is ready!

### Step 4: Connecting to your VPN on a Macbook

Open System Prefereces and click on Network
![System Preference- Network](/img/vpn-screen4.png)

Click the plus button near the bottom left corner to create a new service. 
Then select Interface: VPN and VPN Type: PPTP
![Create a new service](/img/vpn-screen5.png)

Then fill in the following fields:   
Server Address: [DROPLET's IP ADDRESS]  
Account Name: [VPN USERNAME]  
![VPN Fields](/img/vpn-screen6.png)

Then click Authentication Settings and enter your password.
![Authentication Settings](/img/vpn-screen7.png)

Click Advanced and check "Send all traffic over VPN connection"
![Advanced Settings](/img/vpn-screen8.png)

Click Apply and Connect and your VPN should be ready! 

### Step 5: Make sure it's working
Check to make sure your public IP is in Singapore using a IP finder website like [this one](http://whatismyipaddress.com/)  
![Singapore](/img/vpn-screen9.png)