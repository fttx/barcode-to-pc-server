#!/bin/sh

curl https://www.dropbox.com/s/qs6lz1dd9teh76g/InstallerAndExecutableCertificates.encr.p12?dl=1 -o outfile

openssl aes-256-cbc -k "$OPENSSL_PASSWORD" -in scripts/certs/development-cert.cer.enc -d -a -out scripts/certs/development-cert.cer


KEY_CHAIN=mac-build.keychain
security create-keychain -p travis $KEY_CHAIN
# Make the keychain the default so identities are found
security default-keychain -s $KEY_CHAIN
# Unlock the keychain
security unlock-keychain -p travis $KEY_CHAIN
# Set keychain locking timeout to 3600 seconds
security set-keychain-settings -t 3600 -u $KEY_CHAIN

# Add certificates to keychain and allow codesign to access them
security import ./InstallerAndExecutableCertificates.encr.p12 -k ~/Library/Keychains/ios-build.keychain -P $KEY_PASSWORD -T /usr/bin/codesign

security set-key-partition-list -S apple-tool:,apple: -s -k travis ios-build.keychain