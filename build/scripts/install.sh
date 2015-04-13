#!/bin/sh

echo " "
echo "PhoneGap Installation:"
echo " "

npm update -g phonegap cordova grunt-cli bower

echo " "
echo "Creating PhoneGap Project:"
echo " "

phonegap create panic com.manifestinteractive.panicpress Panic
cd panic

echo " "
echo "Clone Panic Press App Repository:"
echo " "

rm -fr www
git clone -b stable git@github.com:manifestinteractive/panic-press-app.git www

echo " "
echo "Updating Cordova Defaults:"
echo " "

rm -fr hooks
rm config.xml

cp -r www/hooks ./
cp www/config.xml ./

chmod 755 hooks/after_prepare/010_remove_junk.js

echo " "
echo "Copy Config File:"
echo " "

cp www/src/js/settings.js.dist www/src/js/settings.js

echo " "
echo "Adding Platforms:"
echo " "

cordova platform add ios
cordova platform add android

echo " "
echo "Installing Required Native Plugins:"
echo " "

cordova plugin add org.apache.cordova.battery-status
cordova plugin add org.apache.cordova.contacts
cordova plugin add org.apache.cordova.device
cordova plugin add org.apache.cordova.device-motion
cordova plugin add org.apache.cordova.device-orientation
cordova plugin add org.apache.cordova.dialogs
cordova plugin add org.apache.cordova.file
cordova plugin add org.apache.cordova.file-transfer
cordova plugin add org.apache.cordova.geolocation
cordova plugin add org.apache.cordova.inappbrowser
cordova plugin add org.apache.cordova.media-capture
cordova plugin add org.apache.cordova.network-information
cordova plugin add org.apache.cordova.splashscreen

echo " "
echo "Installing Required Third-Party Plugins:"
echo " "

cordova plugin add https://github.com/anemitoff/PhoneGap-PhoneDialer.git
cordova plugin add https://github.com/christocracy/cordova-plugin-background-geolocation.git
cordova plugin add https://github.com/cordova-sms/cordova-sms-plugin.git
cordova plugin add https://github.com/danwilson/google-analytics-plugin.git
cordova plugin add https://github.com/EddyVerbruggen/Flashlight-PhoneGap-Plugin.git
cordova plugin add https://github.com/EddyVerbruggen/LaunchMyApp-PhoneGap-Plugin.git --variable URL_SCHEME=panicpress
cordova plugin add https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git
cordova plugin add https://github.com/hazemhagrass/phonegap-base64.git
cordova plugin add https://github.com/katzer/cordova-plugin-background-mode.git
cordova plugin add https://github.com/katzer/cordova-plugin-local-notifications.git
cordova plugin add https://github.com/macdonst/TelephoneNumberPlugin.git
cordova plugin add https://github.com/Paldom/UniqueDeviceID.git
cordova plugin add https://github.com/phonegap-build/StatusBarPlugin.git
cordova plugin add https://github.com/pushandplay/cordova-plugin-apprate.git

echo " "
read -p "Android In App Billing Key [REQUIRED]: " BILLING_KEY

if [[ "$BILLING_KEY" ]]; then
	echo " "
	cordova plugin add https://github.com/j3k0/cordova-plugin-purchase.git --variable BILLING_KEY="$BILLING_KEY"
else
	echo " "
	echo "!!! Invalid Android In App Billing Details, you will need to install this plugin manually."
	echo " "
fi

echo " "
read -p "SendGrid Username [REQUIRED]: " API_USER
read -s -p "SendGrid Password [REQUIRED]: " API_KEY

if [[ "$API_USER" && "$API_KEY" ]]; then
	echo " "
	cordova plugin add https://github.com/Telerik-Verified-Plugins/SendGrid.git --variable API_USER="$API_USER" --variable API_KEY="$API_KEY"
else
	echo " "
	echo "!!! Invalid SendGrid Details, you will need to install this plugin manually."
	echo " "
fi

echo " "
echo "Starting Node Server"
echo " "

cd www
gem install sass
npm install
npm start