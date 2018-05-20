#!/bin/sh

curl $CSC_DOWNLOAD_URL -o ~/certificate.p12 -L
CSC_LINK=~/certificate.p12

# openssl aes-256-cbc -k "$OPENSSL_PASSWORD" -in InstallerAndExecutableCertificates.encr.p12 -d -a -out InstallerAndExecutableCertificates.encr.p12

KEY_CHAIN_NAME=mac-build.keychain
security create-keychain -p travis $KEY_CHAIN_NAME
# Make the keychain the default so identities are found
security default-keychain -s $KEY_CHAIN_NAME
# Unlock the keychain
security unlock-keychain -p travis $KEY_CHAIN_NAME
# Set keychain locking timeout to 3600 seconds
security set-keychain-settings -t 3600 -u $KEY_CHAIN_NAME

# Add certificates to keychain and allow codesign to access them
security import ~/certificate.p12 -k ~/Library/Keychains/$KEY_CHAIN_NAME -P $CSC_KEY_PASSWORD

echo "Add keychain to keychain-list"
security list-keychains -s $KEY_CHAIN_NAME

echo "Settting key partition list"
security set-key-partition-list -S apple-tool:,apple: -s -k travis $KEY_CHAIN_NAME

exit 0;