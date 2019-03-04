# specify the node base image with your desired version node:<version>
FROM node:10.15.1

#Optional field to let you identify yourself as the maintainer of this image.
LABEL maintainer="kang36897@gmail.com"

#Define the default working directory for the command defined in the “ENTRYPOINT” or “CMD” instructions
WORKDIR /root/watchdog/

RUN apt-get update && apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget -y

#Specify commands to make changes to your Image and subsequently the Containers started from this Image. 
RUN cd ~ && mkdir -p watchdog/repository

#Creates a mount point within the Container linking it back to file systems accessible by the Docker Host.
VOLUME /root/watchdog/repository

#Defines files to copy from the Host file system onto the Container

ADD ./public/js/* /root/watchdog/public/js/
ADD ./views/* /root/watchdog/views/

ADD ./dao.js /root/watchdog/dao.js
ADD ./goods.js /root/watchdog/goods.js
ADD ./group_management.js /root/watchdog/group_management.js
ADD ./mybot.js /root/watchdog/mybot.js
ADD ./news_reporter.js /root/watchdog/news_reporter.js
ADD ./session_variety.js /root/watchdog/session_variety.js
ADD ./message_dispatcher.js /root/watchdog/message_dispatcher.js
ADD ./table_warehouse.js /root/watchdog/table_warehouse.js
ADD ./utils.js /root/watchdog/utils.js
ADD ./web_window.js /root/watchdog/web_window.js

# ADD ./package-lock.json /root/watchdog/package-lock.json
ADD ./package.json /root/watchdog/package.json
#ADD ./node_modules/* /root/watchdog/node_modules/
RUN npm install

#Set/modify the environment variables within Containers created from the Image.
ENV group_name "just for test"


# replace this with your application's default port
EXPOSE 3000


#This is the command that will run when the Container starts
CMD ["node","mybot.js"]