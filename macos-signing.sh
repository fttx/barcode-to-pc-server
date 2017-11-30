#!/bin/sh

curl https://www.dropbox.com/s/qs6lz1dd9teh76g/InstallerAndExecutableCertificates.encr.p12?dl=1 -o outfile

openssl aes-256-cbc -k "$OPENSSL_PASSWORD" -in InstallerAndExecutableCertificates.encr.p12 -d -a -out InstallerAndExecutableCertificates.encr.p12


KEY_CHAIN=mac-build.keychain
security create-keychain -p travis $KEY_CHAIN
# Make the keychain the default so identities are found
security default-keychain -s $KEY_CHAIN
# Unlock the keychain
security unlock-keychain -p travis $KEY_CHAIN
# Set keychain locking timeout to 3600 seconds
security set-keychain-settings -t 3600 -u $KEY_CHAIN

# Add certificates to keychain and allow codesign to access them
security import ./InstallerAndExecutableCertificates.encr.p12 -k ~/Library/Keychains/$KEY_CHAIN -P $KEY_PASSWORD -T /usr/bin/codesign

echo "Add keychain to keychain-list"
security list-keychains -s $KEY_CHAIN

echo "Settting key partition list"
security set-key-partition-list -S apple-tool:,apple: -s -k travis $KEY_CHAIN

exit 0;