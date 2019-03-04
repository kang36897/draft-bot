#!/bin/bash

cd ~
mkdir -p watchdog/repository/images
cd watchdog/repository


#you can override the name of group which you want to manage
group_name="just for test"


docker run --rm -it -e group_name="${group_name}" -p 3001:3000  -v $(pwd):/root/watchdog/repository  kang36897/watchdog
#docker run --rm -it -e group_name="${group_name}" -p 3001:3000  -v $(pwd):/root/watchdog/repository  kang36897/watchdog /bin/bash

