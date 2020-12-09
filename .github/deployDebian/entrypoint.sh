#!/bin/bash
echo "Installing Essentials"
apt update
apt install -y git default-jre sudo apt-utils apt-transport-https
npm install -g @oclif/dev-cli
echo "Installing SBT for Scala"
echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
apt update
apt install -y sbt

echo "Cloning Optic"
cd /tmp
git clone https://github.com/opticdev/optic
cd optic
echo "Checking out specific branch"
git checkout release
echo "Building Optic"
source sourceme.sh
optic_build_for_release
echo "Packing Debian Release"
cd ./workspaces/local-cli
npm install
oclif-dev pack:deb
echo "Installing Ruby"
apt install ruby-full -y
gem install deb-s3
export PATH_TO_DEB_AMD="/tmp/optic/workspaces/local-cli/dist/deb/api_$(npm view $INPUT_NPM_PACKAGE_NAME version)-1_amd64.deb"
deb-s3 upload -e --access-key-id=$INPUT_AWS_ACCESS_KEY_ID --secret-access-key=$INPUT_AWS_SECRET_ACCESS_KEY --bucket $INPUT_BUCKET_NAME --prefix $INPUT_PREFIX_NAME --codename $INPUT_PACKAGE_NAME --preserve-versions $PATH_TO_DEB_AMD
